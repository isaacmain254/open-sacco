from django.db import transaction
from decimal import Decimal
import uuid
from datetime import datetime

from .models import SavingsAccount, SavingsTransaction

def post_savings_transaction(
    *,
    account: SavingsAccount,
    transaction_type: str,
    amount: Decimal,
    user,
    narration=""
):
    """
    Post a transaction to a savings account with proper locking and validation.
    
    Args:
        account: The SavingsAccount to transact on
        transaction_type: Type of transaction (deposit, withdrawal, interest, adjustment)
        amount: Transaction amount (must be positive)
        user: User performing the transaction
        narration: Optional description of the transaction
    
    Returns:
        SavingsTransaction: The created transaction object
    
    Raises:
        ValueError: If validation fails
    """
    # Validate amount
    if amount <= 0:
        raise ValueError("Amount must be positive")
    
    # Validate transaction type
    valid_types = [choice[0] for choice in SavingsTransaction.TRANSACTION_TYPES]
    if transaction_type not in valid_types:
        raise ValueError(f"Invalid transaction type. Must be one of: {', '.join(valid_types)}")

    with transaction.atomic():
        # Lock the account row to prevent race conditions
        locked_account = SavingsAccount.objects.select_for_update().get(pk=account.pk)
        
        # Determine balance change
        if transaction_type == SavingsTransaction.WITHDRAWAL:
            if not locked_account.product.allows_withdrawals:
                raise ValueError("Withdrawals not allowed on this account")
            
            # Check minimum balance requirement
            if locked_account.balance < amount:
                raise ValueError("Insufficient balance")
            
            delta = -amount
        elif transaction_type == SavingsTransaction.DEPOSIT:
            delta = amount
        elif transaction_type == SavingsTransaction.INTEREST:
            delta = amount
        elif transaction_type == SavingsTransaction.ADJUSTMENT:
            # Adjustments can be positive or negative based on the amount sign in the caller
            delta = amount
        else:
            delta = amount

        # Generate unique reference using UUID and timestamp
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_ref = f"TXN-{timestamp}-{uuid.uuid4().hex[:8].upper()}"
        
        # Create transaction record
        txn = SavingsTransaction.objects.create(
            account=locked_account,
            transaction_type=transaction_type,
            amount=amount,
            reference=unique_ref,
            narration=narration,
            performed_by=user
        )

        # Update account balance
        locked_account.balance += delta
        locked_account.save(update_fields=["balance"])

    return txn
