from django import forms
from decimal import Decimal
from .models import SavingsTransaction

class SavingsTransactionForm(forms.Form):
    transaction_type = forms.ChoiceField(
        choices=[
            (SavingsTransaction.DEPOSIT, "Deposit"),
            (SavingsTransaction.WITHDRAWAL, "Withdrawal"),
        ]
    )

    amount = forms.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.01")
    )

    narration = forms.CharField(
        widget=forms.Textarea,
        required=False
    )
