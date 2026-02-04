from django import forms

class LoanRepaymentForm(forms.Form):
    amount = forms.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=1,
        label="Repayment Amount",
    )

    narration = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={"rows": 2}),
        label="Narration",
    )
