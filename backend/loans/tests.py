from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import SavingsAccount, SavingsProduct, SavingsTransaction
from members.models import Member
from users.models import User

from .models import LoanAccount, LoanApplication, LoanApplicationDocument, LoanApplicationGuarantor, LoanProduct, LoanSchedule


class LoanApplicationFlowTest(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.loan_officer = User.objects.create_user(
			email="loan@example.com",
			username="loan-officer",
			password="test-password-123",
			role=User.LOAN,
		)
		self.manager = User.objects.create_user(
			email="manager@example.com",
			username="manager",
			password="test-password-123",
			role=User.MANAGER,
		)
		self.accountant = User.objects.create_user(
			email="accountant@example.com",
			username="accountant",
			password="test-password-123",
			role=User.ACCOUNTANT,
		)

		self.member = Member.objects.create(
			first_name="John",
			middle_name="K",
			last_name="Mwangi",
			national_id="12345678",
			phone_number="0712345678",
			email="member@example.com",
			date_of_birth="1990-01-01",
			kra_pin="A123456789B",
			country="Kenya",
			county="Nairobi",
			city="Nairobi",
		)
		self.guarantor_member = Member.objects.create(
			first_name="Jane",
			middle_name="W",
			last_name="Kamau",
			national_id="87654321",
			phone_number="0722000000",
			email="guarantor@example.com",
			date_of_birth="1992-02-02",
			kra_pin="B123456789C",
			country="Kenya",
			county="Kiambu",
			city="Ruiru",
		)
		self.product = SavingsProduct.objects.create(
			name="Ordinary Savings",
			code="OS",
			minimum_balance=Decimal("0.00"),
			interest_rate=Decimal("2.50"),
			withdrawal_fee=Decimal("0.00"),
			allows_withdrawals=True,
		)
		self.account = SavingsAccount.objects.create(
			member=self.member,
			product=self.product,
			balance=Decimal("100000.00"),
		)
		self.loan_type = LoanProduct.objects.create(
			name="Development Loan",
			interest_rate=Decimal("12.00"),
			repayment_period_months=12,
			multiplier=Decimal("3.00"),
			min_amount=Decimal("1000.00"),
			max_amount=Decimal("500000.00"),
			max_term_months=24,
			requires_guarantors=True,
			is_active=True,
		)

	def _create_application(self):
		self.client.force_authenticate(self.loan_officer)
		response = self.client.post(
			"/api/v1/loans/",
			{
				"member": self.member.membership_number,
				"loan_type": self.loan_type.id,
				"requested_amount": "120000.00",
				"purpose": "Home improvement",
				"repayment_period_months": 12,
				"employer": "ACME Ltd",
				"payroll_number": "PR123",
				"gross_salary": "90000.00",
				"net_salary": "65000.00",
				"security_type": LoanApplication.SecurityType.GUARANTORS,
				"collateral_description": "",
				"remarks": "Manual paper form received",
			},
			format="json",
		)
		self.assertEqual(response.status_code, 201)
		return response.data["application_number"]

	def test_end_to_end_loan_application_flow(self):
		application_number = self._create_application()

		guarantor_response = self.client.post(
			f"/api/v1/loans/{application_number}/guarantors/",
			{
				"member": self.guarantor_member.membership_number,
				"guaranteed_amount": "120000.00",
			},
			format="json",
		)
		self.assertEqual(guarantor_response.status_code, 201)
		self.assertEqual(LoanApplicationGuarantor.objects.count(), 1)

		document_response = self.client.post(
			f"/api/v1/loans/{application_number}/documents/",
			{
				"document_type": "Payslip",
				"file": SimpleUploadedFile("payslip.txt", b"payslip-content", content_type="text/plain"),
			},
		)
		self.assertEqual(document_response.status_code, 201)
		self.assertEqual(LoanApplicationDocument.objects.count(), 1)

		submit_response = self.client.post(f"/api/v1/loans/{application_number}/submit/", {}, format="json")
		self.assertEqual(submit_response.status_code, 200)
		self.assertEqual(submit_response.data["status"], LoanApplication.Status.SUBMITTED)
		self.assertIn("eligibility_summary", submit_response.data)

		self.client.force_authenticate(self.manager)
		review_response = self.client.post(f"/api/v1/loans/{application_number}/review/", {}, format="json")
		self.assertEqual(review_response.status_code, 200)
		self.assertEqual(review_response.data["status"], LoanApplication.Status.UNDER_REVIEW)

		approve_response = self.client.post(
			f"/api/v1/loans/{application_number}/approve/",
			{"approval_notes": "Meets branch review requirements."},
			format="json",
		)
		self.assertEqual(approve_response.status_code, 200)
		self.assertEqual(approve_response.data["status"], LoanApplication.Status.APPROVED)

		disburse_response = self.client.post(
			f"/api/v1/loans/{application_number}/disburse/",
			{
				"account_number": self.account.account_number,
				"disbursement_notes": "Disbursed to savings account.",
			},
			format="json",
		)
		self.assertEqual(disburse_response.status_code, 200)
		self.assertEqual(disburse_response.data["status"], LoanApplication.Status.DISBURSED)

		self.account.refresh_from_db()
		self.assertEqual(self.account.balance, Decimal("220000.00"))
		self.assertTrue(LoanAccount.objects.filter(application__application_number=application_number).exists())
		self.assertTrue(
			SavingsTransaction.objects.filter(
				account=self.account,
				transaction_type=SavingsTransaction.DEPOSIT,
				amount=Decimal("120000.00"),
			).exists()
		)
		loan = LoanAccount.objects.get(application__application_number=application_number)
		installment = LoanSchedule.objects.get(loan=loan, installment_number=1)
		self.assertEqual(loan.schedule.count(), 12)
		self.assertGreater(loan.outstanding_interest, Decimal("0.00"))

		repayment_response = self.client.post(
			f"/api/v1/loans/{application_number}/repay/",
			{
				"account_number": self.account.account_number,
				"installment_number": 1,
				"narration": "Manual first installment payment.",
			},
			format="json",
		)
		self.assertEqual(repayment_response.status_code, 200)
		installment.refresh_from_db()
		loan.refresh_from_db()
		self.account.refresh_from_db()
		self.assertTrue(installment.is_paid)
		self.assertEqual(self.account.balance, Decimal("220000.00") - installment.total_due)
		self.assertEqual(loan.outstanding_principal, Decimal("120000.00") - installment.principal_due)
		self.assertTrue(
			SavingsTransaction.objects.filter(
				account=self.account,
				transaction_type=SavingsTransaction.WITHDRAWAL,
				amount=installment.total_due,
			).exists()
		)

	def test_only_draft_applications_can_be_edited(self):
		application_number = self._create_application()
		self.client.post(f"/api/v1/loans/{application_number}/submit/", {}, format="json")

		response = self.client.patch(
			f"/api/v1/loans/{application_number}/",
			{"purpose": "Updated purpose"},
			format="json",
		)
		self.assertEqual(response.status_code, 400)

	def test_non_review_role_cannot_approve(self):
		application_number = self._create_application()
		self.client.post(f"/api/v1/loans/{application_number}/submit/", {}, format="json")

		response = self.client.post(
			f"/api/v1/loans/{application_number}/approve/",
			{"approval_notes": "Trying to approve as officer."},
			format="json",
		)
		self.assertEqual(response.status_code, 403)

	def test_non_loan_user_cannot_access_loan_module(self):
		self.client.force_authenticate(self.accountant)
		response = self.client.get("/api/v1/loans/")
		self.assertEqual(response.status_code, 403)

	def test_self_guarantee_requires_sufficient_member_deposits(self):
		application_number = self._create_application()

		response = self.client.post(
			f"/api/v1/loans/{application_number}/guarantors/",
			{
				"member": self.member.membership_number,
				"guaranteed_amount": "120000.00",
			},
			format="json",
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(LoanApplicationGuarantor.objects.count(), 0)
