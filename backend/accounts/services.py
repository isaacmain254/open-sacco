from django.db import transaction
from decimal import Decimal

from .models import SavingsAccount, SavingsTransaction

def post_savings_transaction(
    *,
    account: SavingsAccount,
    transaction_type: str,
    amount: Decimal,
    user,
    narration=""
):
    if amount <= 0:
        raise ValueError("Amount must be positive")

    if transaction_type == SavingsTransaction.WITHDRAWAL:
        if not account.product.allows_withdrawals:
            raise ValueError("Withdrawals not allowed on this account")

        if account.balance < amount:
            raise ValueError("Insufficient balance")

        delta = -amount
    else:
        delta = amount

    with transaction.atomic():
        txn = SavingsTransaction.objects.create(
            account=account,
            transaction_type=transaction_type,
            amount=amount,
            reference=f"TXN{account.id}{SavingsTransaction.objects.count()+1}",
            narration=narration,
            performed_by=user
        )

        account.balance += delta
        account.save(update_fields=["balance"])

    return txn
