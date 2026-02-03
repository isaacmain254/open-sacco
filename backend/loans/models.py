from django.db import models, transaction
from django.conf import settings
from django.utils import timezone
from members.models import Member


def generate_loan_number():
    year = timezone.now().year

    with transaction.atomic():
        last_loan = (
            LoanAccount.objects
            .select_for_update()
            .filter(loan_number__startswith=f"LN-{year}")
            .order_by("-id")
            .first()
        )

        last_seq = int(last_loan.loan_number.split("-")
                       [-1]) if last_loan else 0
        next_seq = last_seq + 1

        return f"LN-{year}-{next_seq:05d}"


# Loan products
class LoanProduct(models.Model):
    """
     LoanProduct - defines loan rules
    """
    REDUCING = "reducing"
    FLAT = "flat"

    INTEREST_TYPE_CHOICES = [
        (REDUCING, "Reducing Balance"),
        (FLAT, "Flat Rate"),
    ]

    name = models.CharField(max_length=100)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    interest_type = models.CharField(
        max_length=20,
        choices=INTEREST_TYPE_CHOICES,
        default=REDUCING,
    )

    min_amount = models.DecimalField(max_digits=12, decimal_places=2)
    max_amount = models.DecimalField(max_digits=12, decimal_places=2)
    max_term_months = models.PositiveIntegerField()

    requires_guarantors = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

# Loan Account


class LoanAccount(models.Model):
    """
    LoanAccount has the actual loan
    """
    PENDING = "pending"
    APPROVED = "approved"
    DISBURSED = "disbursed"
    CLOSED = "closed"
    DEFAULTED = "defaulted"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (APPROVED, "Approved"),
        (DISBURSED, "Disbursed"),
        (CLOSED, "Closed"),
        (DEFAULTED, "Defaulted"),
    ]

    loan_number = models.CharField(max_length=20, unique=True)

    member = models.ForeignKey(Member, on_delete=models.PROTECT)
    product = models.ForeignKey(LoanProduct, on_delete=models.PROTECT)

    principal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)

    term_months = models.PositiveIntegerField()

    approved_at = models.DateTimeField(null=True, blank=True)
    disbursed_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING,
    )

    outstanding_principal = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    outstanding_interest = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_loans",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.loan_number

    def save(self, *args, **kwargs):
        if not self.loan_number:
            self.loan_number = generate_loan_number()
        super().save(*args, **kwargs)


# Loan Schedule
class LoanSchedule(models.Model):
    """
    LoanSchedule contains the expected installments/payments, not actual payments.
    """
    loan = models.ForeignKey(
        LoanAccount,
        on_delete=models.CASCADE,
        related_name="schedule",
    )

    installment_number = models.PositiveIntegerField()
    due_date = models.DateField()

    principal_due = models.DecimalField(max_digits=12, decimal_places=2)
    interest_due = models.DecimalField(max_digits=12, decimal_places=2)
    total_due = models.DecimalField(max_digits=12, decimal_places=2)

    is_paid = models.BooleanField(default=False)

    class Meta:
        unique_together = ("loan", "installment_number")

    def __str__(self):
        return f"{self.loan.loan_number} - Installment {self.installment_number}"

# Loan Transactions


class LoanTransaction(models.Model):
    """
    LoadTransactions contains loan disbursements & repayments transactions
    """
    DISBURSEMENT = "disbursement"
    REPAYMENT = "repayment"
    INTEREST_POSTING = "interest"
    REVERSAL = "reversal"

    TRANSACTION_TYPE_CHOICES = [
        (DISBURSEMENT, "Disbursement"),
        (REPAYMENT, "Repayment"),
        (INTEREST_POSTING, "Interest Posting"),
        (REVERSAL, "Reversal"),
    ]

    loan = models.ForeignKey(
        LoanAccount,
        on_delete=models.PROTECT,
        related_name="transactions",
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPE_CHOICES,
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=50, unique=True)

    narration = models.TextField(blank=True)

    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.reference
