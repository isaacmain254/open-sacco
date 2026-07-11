from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from accounts.models import SavingsTransaction
from accounts.services import post_savings_transaction

from .models import LoanAccount, LoanApplication, LoanProduct, LoanTransaction


MINIMUM_MEMBERSHIP_MONTHS = getattr(settings, "LOAN_MINIMUM_MEMBERSHIP_MONTHS", 3)
MINIMUM_MONTHLY_CONTRIBUTION = Decimal(
    str(getattr(settings, "LOAN_MINIMUM_MONTHLY_CONTRIBUTION", "0.00"))
)
DEFAULT_LOAN_MULTIPLIER = Decimal("3.00")


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
    if application.repayment_period_months:
        estimated_monthly_installment = application.requested_amount / Decimal(application.repayment_period_months)

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
