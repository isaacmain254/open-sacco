from django.db import models, transaction


def generate_account_number():
    last = SavingsAccount.objects.order_by("-id").first()
    next_id = (last.id + 1) if last else 1
    return f"SA{next_id:08d}"


class SavingsProduct(models.Model):
    """
        This models id used to create account types e.g fixed account, current account
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)

    minimum_balance = models.DecimalField(
        max_digits=12, decimal_places=2, default=0)
    interest_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=0)

    withdrawal_fee = models.DecimalField(
        max_digits=12, decimal_places=2, default=0)
    allows_withdrawals = models.BooleanField(default=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class SavingsAccount(models.Model):
    member = models.ForeignKey(
        "members.Member",
        on_delete=models.CASCADE,
        related_name="accounts"
    )

    product = models.ForeignKey(
        SavingsProduct,
        on_delete=models.PROTECT
    )

    account_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        db_index=True
    )

    balance = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0
    )

    is_active = models.BooleanField(default=True)
    opened_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.account_number:
            with transaction.atomic():
                self.account_number = generate_account_number()
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ("member", "product")

    def __str__(self):
        return f"{self.account_number} - {self.member}"
    

class SavingsTransaction(models.Model):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    INTEREST = "interest"
    ADJUSTMENT = "adjustment"

    TRANSACTION_TYPES = [
        (DEPOSIT, "Deposit"),
        (WITHDRAWAL, "Withdrawal"),
        (INTEREST, "Interest"),
        (ADJUSTMENT, "Adjustment"),
    ]

    account = models.ForeignKey(
        SavingsAccount,
        on_delete=models.PROTECT,
        related_name="transactions"
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPES
    )

    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2
    )

    reference = models.CharField(
        max_length=50,
        unique=True,
        db_index=True
    )

    narration = models.TextField(blank=True)

    performed_by = models.ForeignKey(
        "auth.User",
        on_delete=models.PROTECT
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.transaction_type} - {self.amount}"
