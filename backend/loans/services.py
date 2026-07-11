from calendar import monthrange
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from accounts.models import SavingsTransaction
from accounts.services import post_savings_transaction

from .models import LoanAccount, LoanApplication, LoanProduct, LoanSchedule, LoanTransaction


MINIMUM_MEMBERSHIP_MONTHS = getattr(settings, "LOAN_MINIMUM_MEMBERSHIP_MONTHS", 3)
MINIMUM_MONTHLY_CONTRIBUTION = Decimal(
    str(getattr(settings, "LOAN_MINIMUM_MONTHLY_CONTRIBUTION", "0.00"))
)
DEFAULT_LOAN_MULTIPLIER = Decimal("3.00")
MONEY = Decimal("0.01")


def _money(value):
    return Decimal(value).quantize(MONEY, rounding=ROUND_HALF_UP)


def _add_months(value: date, months: int) -> date:
    month = value.month - 1 + months
    year = value.year + month // 12
    month = month % 12 + 1
    return date(year, month, min(value.day, monthrange(year, month)[1]))


def create_repayment_schedule(*, loan: LoanAccount):
    """Create monthly installments using the product's configured interest method."""
    principal, months = loan.principal_amount, loan.term_months
    annual_rate = loan.interest_rate / Decimal("100")
    rows = []

    if loan.product.interest_type == LoanProduct.FLAT:
        total_interest = _money(principal * annual_rate * Decimal(months) / Decimal("12"))
        monthly_principal, monthly_interest = _money(principal / months), _money(total_interest / months)
        principal_remaining, interest_remaining = principal, total_interest
        for number in range(1, months + 1):
            principal_due = principal_remaining if number == months else monthly_principal
            interest_due = interest_remaining if number == months else monthly_interest
            rows.append((principal_due, interest_due))
            principal_remaining -= principal_due
            interest_remaining -= interest_due
    else:
        monthly_rate = annual_rate / Decimal("12")
        payment = _money(principal / months) if not monthly_rate else _money(
            principal * monthly_rate / (Decimal("1") - (Decimal("1") + monthly_rate) ** -months)
        )
        principal_remaining = principal
        for number in range(1, months + 1):
            interest_due = _money(principal_remaining * monthly_rate)
            principal_due = principal_remaining if number == months else _money(payment - interest_due)
            rows.append((principal_due, interest_due))
            principal_remaining -= principal_due

    schedules = [
        LoanSchedule(
            loan=loan,
            installment_number=number,
            due_date=_add_months(loan.disbursed_at.date(), number),
            principal_due=principal_due,
            interest_due=interest_due,
            total_due=_money(principal_due + interest_due),
        )
        for number, (principal_due, interest_due) in enumerate(rows, start=1)
    ]
    LoanSchedule.objects.bulk_create(schedules)
    return schedules


def post_installment_repayment(*, loan: LoanAccount, installment_number: int, account, user, narration=""):
    """Debit a member account and settle exactly one scheduled installment."""
    with transaction.atomic():
        loan = LoanAccount.objects.select_for_update().get(pk=loan.pk)
        if loan.status != LoanAccount.DISBURSED:
            raise ValueError("Loan is not active.")
        installment = LoanSchedule.objects.select_for_update().get(loan=loan, installment_number=installment_number)
        if installment.is_paid:
            raise ValueError("This installment has already been paid.")

        payment = LoanTransaction.objects.create(
            loan=loan,
            transaction_type=LoanTransaction.REPAYMENT,
            amount=installment.total_due,
            reference=f"REPAY-{loan.loan_number}-{installment.installment_number}",
            narration=narration or f"Installment {installment.installment_number} repayment",
            performed_by=user,
        )
        post_savings_transaction(
            account=account,
            transaction_type=SavingsTransaction.WITHDRAWAL,
            amount=installment.total_due,
            user=user,
            narration=narration or f"Loan {loan.loan_number} installment {installment.installment_number}",
        )
        installment.is_paid = True
        installment.paid_at = timezone.now()
        installment.paid_by = user
        installment.payment_transaction = payment
        installment.save(update_fields=["is_paid", "paid_at", "paid_by", "payment_transaction"])

        loan.outstanding_principal = max(Decimal("0.00"), loan.outstanding_principal - installment.principal_due)
        loan.outstanding_interest = max(Decimal("0.00"), loan.outstanding_interest - installment.interest_due)
        if not loan.schedule.filter(is_paid=False).exists():
            loan.status = LoanAccount.CLOSED
        loan.save(update_fields=["outstanding_principal", "outstanding_interest", "status"])
        return installment


def _months_between(start_date, end_date):
    return max(0, (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month))


def build_eligibility_summary(application: LoanApplication):
    member = application.member
    today = timezone.now().date()
    membership_months = _months_between(member.date_joined, today)
    deposits = member.accounts.aggregate(total=Sum("balance")).get("total") or Decimal("0.00")
    monthly_contribution = (
        SavingsTransaction.objects.filter(
            account__member=member,
            transaction_type=SavingsTransaction.DEPOSIT,
            created_at__date__gte=today.replace(day=1),
        ).aggregate(total=Sum("amount")).get("total")
        or Decimal("0.00")
    )
    multiplier = application.loan_type.multiplier or DEFAULT_LOAN_MULTIPLIER
    eligible_amount = deposits * multiplier
    active_loans = LoanAccount.objects.filter(
        member=member,
        status__in=[LoanAccount.APPROVED, LoanAccount.DISBURSED, LoanAccount.DEFAULTED],
    )
    outstanding_balance = active_loans.aggregate(total=Sum("outstanding_principal")).get("total") or Decimal("0.00")
    total_guaranteed = application.guarantors.aggregate(total=Sum("guaranteed_amount")).get("total") or Decimal("0.00")

    estimated_monthly_installment = Decimal("0.00")
    estimated_total_interest = Decimal("0.00")
    estimated_total_repayable = application.requested_amount
    if application.repayment_period_months:
        months = application.repayment_period_months
        annual_rate = application.loan_type.interest_rate / Decimal("100")
        if application.loan_type.interest_type == LoanProduct.FLAT:
            estimated_total_interest = _money(
                application.requested_amount * annual_rate * Decimal(months) / Decimal("12")
            )
            estimated_total_repayable = application.requested_amount + estimated_total_interest
            estimated_monthly_installment = _money(estimated_total_repayable / months)
        else:
            monthly_rate = annual_rate / Decimal("12")
            estimated_monthly_installment = _money(application.requested_amount / months) if not monthly_rate else _money(
                application.requested_amount * monthly_rate /
                (Decimal("1") - (Decimal("1") + monthly_rate) ** -months)
            )
            estimated_total_repayable = estimated_monthly_installment * months
            estimated_total_interest = estimated_total_repayable - application.requested_amount

    two_thirds_salary_limit = None
    if application.gross_salary:
        two_thirds_salary_limit = (application.gross_salary * Decimal("2")) / Decimal("3")

    warnings = []
    if membership_months < MINIMUM_MEMBERSHIP_MONTHS:
        warnings.append({
            "code": "membership_duration",
            "message": f"Member has only been active for {membership_months} months. Minimum recommended period is {MINIMUM_MEMBERSHIP_MONTHS} months.",
        })

    if MINIMUM_MONTHLY_CONTRIBUTION > 0 and monthly_contribution < MINIMUM_MONTHLY_CONTRIBUTION:
        warnings.append({
            "code": "monthly_contribution",
            "message": (
                f"Monthly contribution of {monthly_contribution} is below the "
                f"recommended minimum of {MINIMUM_MONTHLY_CONTRIBUTION}."
            ),
        })

    if application.requested_amount > eligible_amount:
        warnings.append({
            "code": "loan_multiplier",
            "message": f"Requested amount exceeds the indicative eligibility limit of {eligible_amount} based on deposits and multiplier.",
        })

    if active_loans.exists() and outstanding_balance > 0:
        warnings.append({
            "code": "existing_loans",
            "message": f"Member has {active_loans.count()} active loan(s) with outstanding balance {outstanding_balance}.",
        })

    if two_thirds_salary_limit is not None and estimated_monthly_installment > two_thirds_salary_limit:
        warnings.append({
            "code": "salary_rule",
            "message": "Estimated monthly installment exceeds the two-thirds gross salary guideline.",
        })

    if application.security_type != LoanApplication.SecurityType.COLLATERAL:
        self_guaranteed = application.requested_amount <= deposits
        if not self_guaranteed and total_guaranteed < application.requested_amount:
            warnings.append({
                "code": "guarantors",
                "message": "Total guaranteed amount is below the requested loan amount.",
            })

    return {
        "membership_date": member.date_joined,
        "membership_months": membership_months,
        "current_deposits": deposits,
        "monthly_contribution": monthly_contribution,
        "minimum_monthly_contribution": MINIMUM_MONTHLY_CONTRIBUTION,
        "loan_multiplier": multiplier,
        "eligible_amount": eligible_amount,
        "active_loans": active_loans.count(),
        "outstanding_balance": outstanding_balance,
        "estimated_monthly_installment": estimated_monthly_installment,
        "estimated_total_interest": estimated_total_interest,
        "estimated_total_repayable": estimated_total_repayable,
        "two_thirds_salary_limit": two_thirds_salary_limit,
        "total_guaranteed": total_guaranteed,
        "warnings": warnings,
    }


def disburse_application(*, application: LoanApplication, account, user, notes=""):
    with transaction.atomic():
        # Lock the application first so two approval requests cannot credit the
        # member account twice. The account service locks the account row itself.
        application = (
            LoanApplication.objects.select_for_update()
            .select_related("member", "loan_type")
            .get(pk=application.pk)
        )

        if application.status != LoanApplication.Status.APPROVED:
            raise ValueError("Only approved applications can be disbursed.")

        if LoanAccount.objects.filter(application=application).exists():
            raise ValueError("This application has already been disbursed.")

        if account.member_id != application.member_id:
            raise ValueError("Disbursement account must belong to the application member.")

        loan_account = LoanAccount.objects.create(
            application=application,
            member=application.member,
            product=application.loan_type,
            principal_amount=application.requested_amount,
            interest_rate=application.loan_type.interest_rate,
            term_months=application.repayment_period_months,
            approved_at=application.approved_at,
            disbursed_at=timezone.now(),
            status=LoanAccount.DISBURSED,
            outstanding_principal=application.requested_amount,
            outstanding_interest=Decimal("0.00"),
            created_by=application.created_by,
        )

        post_savings_transaction(
            account=account,
            transaction_type=SavingsTransaction.DEPOSIT,
            amount=application.requested_amount,
            user=user,
            narration=notes or f"Loan disbursement for {application.application_number}",
        )

        LoanTransaction.objects.create(
            loan=loan_account,
            transaction_type=LoanTransaction.DISBURSEMENT,
            amount=application.requested_amount,
            reference=f"LTX-{application.application_number}",
            narration=notes or f"Loan disbursement to {account.account_number}",
            performed_by=user,
        )

        schedule = create_repayment_schedule(loan=loan_account)
        loan_account.outstanding_interest = sum(
            (item.interest_due for item in schedule), Decimal("0.00")
        )
        loan_account.save(update_fields=["outstanding_interest"])

        application.status = LoanApplication.Status.DISBURSED
        application.disbursed_by = user
        application.disbursed_at = timezone.now()
        application.disbursement_notes = notes
        application.save(update_fields=[
            "status",
            "disbursed_by",
            "disbursed_at",
            "disbursement_notes",
        ])

    return loan_account
