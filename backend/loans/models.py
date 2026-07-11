from decimal import Decimal

from django.conf import settings
from django.db import models, transaction
from django.utils import timezone

from accounts.models import SavingsAccount
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


def generate_application_number():
    year = timezone.now().year

    with transaction.atomic():
        last_application = (
            LoanApplication.objects
            .select_for_update()
            .filter(application_number__startswith=f"LA-{year}")
            .order_by("-id")
            .first()
        )

        last_seq = (
            int(last_application.application_number.split("-")[-1])
            if last_application else 0
        )
        next_seq = last_seq + 1
        return f"LA-{year}-{next_seq:05d}"


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
    repayment_period_months = models.PositiveIntegerField(default=12)
    multiplier = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("3.00"))
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


class LoanApplication(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under Review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        DISBURSED = "disbursed", "Disbursed"

    class SecurityType(models.TextChoices):
        SELF_GUARANTEE = "self_guarantee", "Self Guarantee"
        GUARANTORS = "guarantors", "Guarantors"
        COLLATERAL = "collateral", "Collateral"
        MIXED = "mixed", "Mixed"

    application_number = models.CharField(max_length=20, unique=True, editable=False)
    member = models.ForeignKey(
        Member,
        on_delete=models.PROTECT,
        related_name="loan_applications",
    )
    loan_type = models.ForeignKey(
        LoanProduct,
        on_delete=models.PROTECT,
        related_name="applications",
    )
    requested_amount = models.DecimalField(max_digits=12, decimal_places=2)
    purpose = models.TextField()
    repayment_period_months = models.PositiveIntegerField()

    employer = models.CharField(max_length=255, blank=True)
    payroll_number = models.CharField(max_length=100, blank=True)
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    security_type = models.CharField(
        max_length=30,
        choices=SecurityType.choices,
        default=SecurityType.SELF_GUARANTEE,
    )
    collateral_description = models.TextField(blank=True)
    remarks = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_loan_applications",
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="submitted_loan_applications",
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="reviewed_loan_applications",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="approved_loan_applications",
    )
    rejected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="rejected_loan_applications",
    )
    disbursed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="disbursed_loan_applications",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    disbursed_at = models.DateTimeField(null=True, blank=True)

    approval_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    disbursement_notes = models.TextField(blank=True)
    eligibility_warnings = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.application_number

    def save(self, *args, **kwargs):
        if not self.application_number:
            self.application_number = generate_application_number()
        super().save(*args, **kwargs)

    def can_edit(self):
        return self.status == self.Status.DRAFT

    def submit(self, user, warnings=None):
        if self.status != self.Status.DRAFT:
            raise ValueError("Only draft applications can be submitted.")

        self.status = self.Status.SUBMITTED
        self.submitted_by = user
        self.submitted_at = timezone.now()
        self.eligibility_warnings = warnings or self.eligibility_warnings
        self.save(update_fields=[
            "status",
            "submitted_by",
            "submitted_at",
            "eligibility_warnings",
        ])

    def start_review(self, user):
        if self.status != self.Status.SUBMITTED:
            raise ValueError("Only submitted applications can be moved to under review.")

        self.status = self.Status.UNDER_REVIEW
        self.reviewed_by = user
        self.reviewed_at = timezone.now()
        self.save(update_fields=["status", "reviewed_by", "reviewed_at"])

    def approve(self, user, notes=""):
        if self.status != self.Status.UNDER_REVIEW:
            raise ValueError("Only applications under review can be approved.")

        self.status = self.Status.APPROVED
        self.approved_by = user
        self.approved_at = timezone.now()
        self.approval_notes = notes
        self.save(update_fields=[
            "status",
            "approved_by",
            "approved_at",
            "approval_notes",
        ])

    def reject(self, user, reason):
        if self.status != self.Status.UNDER_REVIEW:
            raise ValueError("Only applications under review can be rejected.")
        if not reason:
            raise ValueError("Rejection reason is required.")

        self.status = self.Status.REJECTED
        self.rejected_by = user
        self.rejected_at = timezone.now()
        self.rejection_reason = reason
        self.save(update_fields=[
            "status",
            "rejected_by",
            "rejected_at",
            "rejection_reason",
        ])


def loan_document_upload_path(instance, filename):
    application_number = instance.application.application_number or "draft"
    return f"loan-applications/{application_number}/{filename}"


class LoanApplicationGuarantor(models.Model):
    application = models.ForeignKey(
        LoanApplication,
        on_delete=models.CASCADE,
        related_name="guarantors",
    )
    member = models.ForeignKey(
        Member,
        on_delete=models.PROTECT,
        related_name="guaranteed_loan_applications",
    )
    guaranteed_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("application", "member")
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.application.application_number} - {self.member.membership_number}"


class LoanApplicationDocument(models.Model):
    application = models.ForeignKey(
        LoanApplication,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    document_type = models.CharField(max_length=100)
    file = models.FileField(upload_to=loan_document_upload_path)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="uploaded_loan_documents",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.application.application_number} - {self.document_type}"

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
    application = models.OneToOneField(
        LoanApplication,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="loan_account",
    )

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
