from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import SavingsAccount, SavingsProduct, SavingsTransaction
from customers.models import Account, Customer, Transaction
from loans.models import LoanAccount, LoanProduct, LoanSchedule, LoanTransaction
from members.models import EmploymentDetail, Member, NextOfKin
from users.models import User


class Command(BaseCommand):
    help = "Create demo data for the main SACCO modules"

    def handle(self, *args, **options):
        if not User.objects.filter(email="admin@example.com").exists():
            admin = User.objects.create_superuser(
                email="admin@example.com",
                username="admin",
                password="admin12345",
                role=User.ADMIN,
            )
        else:
            admin = User.objects.get(email="admin@example.com")

        if not Member.objects.exists():
            member = Member.objects.create(
                first_name="John",
                middle_name="Kamau",
                last_name="Mwangi",
                national_id="12345678",
                phone_number="0712345678",
                email="member@example.com",
                date_of_birth=timezone.now().date().replace(year=timezone.now().year - 30),
                kra_pin="A123456789",
                country="Kenya",
                county="Nairobi",
                city="Nairobi",
            )
            NextOfKin.objects.create(
                member=member,
                name="Jane Mwangi",
                relationship="Spouse",
                phone_number="0723456789",
                national_id="87654321",
            )
            EmploymentDetail.objects.create(
                member=member,
                employment_type="EMPLOYED",
                employer_name="Open SACCO",
                job_title="Operations Officer",
                monthly_income=Decimal("95000.00"),
            )
        else:
            member = Member.objects.first()

        if not Customer.objects.exists():
            customer = Customer.objects.create(
                salutation=Customer.Salutation.MR,
                first_name="Grace",
                middle_name="Achieng",
                last_name="Otieno",
                id_number="C100001",
                phone_number="0798765432",
                email="customer@example.com",
                date_of_birth=timezone.now().date().replace(year=timezone.now().year - 28),
                tax_number="P051234567X",
                country="Kenya",
                county="Mombasa",
                city="Mombasa",
                po_box=1234,
            )
        else:
            customer = Customer.objects.first()

        if not SavingsProduct.objects.exists():
            savings_product = SavingsProduct.objects.create(
                name="Basic Savings",
                code="BSV",
                minimum_balance=Decimal("100.00"),
                interest_rate=Decimal("4.50"),
                withdrawal_fee=Decimal("20.00"),
                allows_withdrawals=True,
                is_active=True,
            )
        else:
            savings_product = SavingsProduct.objects.first()

        if not SavingsAccount.objects.exists():
            savings_account = SavingsAccount.objects.create(
                member=member,
                product=savings_product,
                balance=Decimal("1500.00"),
            )
        else:
            savings_account = SavingsAccount.objects.first()

        if not SavingsTransaction.objects.exists():
            SavingsTransaction.objects.create(
                account=savings_account,
                transaction_type=SavingsTransaction.DEPOSIT,
                amount=Decimal("1500.00"),
                reference="SAV-1001",
                narration="Initial deposit",
                performed_by=admin,
            )

        if not Account.objects.exists():
            account = Account.objects.create(
                customer=customer,
                account_type=Account.AccountType.SAVINGS,
                balance=Decimal("2500.00"),
                status=Account.AccountStatus.ACTIVE,
            )
        else:
            account = Account.objects.first()

        if not Transaction.objects.exists():
            Transaction.objects.create(
                transaction_type=Transaction.TransactionType.DEPOSIT,
                amount=Decimal("2500.00"),
                description="Initial account opening deposit",
                account=account,
                served_by="Admin",
            )

        if not LoanProduct.objects.exists():
            loan_product = LoanProduct.objects.create(
                name="Emergency Loan",
                interest_rate=Decimal("12.00"),
                interest_type=LoanProduct.REDUCING,
                min_amount=Decimal("1000.00"),
                max_amount=Decimal("50000.00"),
                max_term_months=12,
                requires_guarantors=False,
                is_active=True,
            )
        else:
            loan_product = LoanProduct.objects.first()

        if not LoanAccount.objects.exists():
            loan_account = LoanAccount.objects.create(
                member=member,
                product=loan_product,
                principal_amount=Decimal("10000.00"),
                interest_rate=Decimal("12.00"),
                term_months=6,
                outstanding_principal=Decimal("10000.00"),
                outstanding_interest=Decimal("600.00"),
                created_by=admin,
            )
        else:
            loan_account = LoanAccount.objects.first()

        if not LoanSchedule.objects.exists():
            LoanSchedule.objects.create(
                loan=loan_account,
                installment_number=1,
                due_date=timezone.now().date(),
                principal_due=Decimal("1666.67"),
                interest_due=Decimal("100.00"),
                total_due=Decimal("1766.67"),
            )

        if not LoanTransaction.objects.exists():
            LoanTransaction.objects.create(
                loan=loan_account,
                transaction_type=LoanTransaction.DISBURSEMENT,
                amount=Decimal("10000.00"),
                reference="LN-1001",
                narration="Loan disbursement",
                performed_by=admin,
            )

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
