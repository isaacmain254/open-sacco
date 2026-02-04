from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path
from django.contrib import messages
from django.utils import timezone
from django.template.response import TemplateResponse

from .models import (
    LoanProduct,
    LoanAccount,
    LoanTransaction,
)
from .forms import LoanRepaymentForm



@admin.register(LoanProduct)
class LoanProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "interest_rate",
        "interest_type",
        "min_amount",
        "max_amount",
        "max_term_months",
        "is_active",
    )
    list_filter = ("is_active", "interest_type")


class LoanTransactionInline(admin.TabularInline):
    model = LoanTransaction
    extra = 0
    readonly_fields = (
        "narration",
        "transaction_type",
        "amount",
        "reference",
        "performed_by",
        "created_at",
    )
    can_delete = False


@admin.register(LoanAccount)
class LoanAccountAdmin(admin.ModelAdmin):
    list_display = (
        "loan_number",
        "member",
        "product",
        "principal_amount",
        "status",
        "outstanding_principal",
        "created_at",
    )

    list_filter = ("status", "product")
    search_fields = ("loan_number", "member__membership_number")

    readonly_fields = (
        "loan_number",
        "outstanding_principal",
        "outstanding_interest",
        "approved_at",
        "disbursed_at",
        "created_at",
    )

    inlines = [LoanTransactionInline]

    change_form_template = "admin/loans/loanaccount/change_form.html"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "<int:loan_id>/approve/",
                self.admin_site.admin_view(self.approve_loan),
                name="loan_approve",
            ),
            path(
                "<int:loan_id>/disburse/",
                self.admin_site.admin_view(self.disburse_loan),
                name="loan_disburse",
            ),
            path(
                "<int:loan_id>/repay/",
                self.admin_site.admin_view(self.repay_loan),
                name="loan_repay",
            ),
        ]
        return custom_urls + urls

    def approve_loan(self, request, loan_id):
        loan = LoanAccount.objects.get(id=loan_id)

        if loan.status != LoanAccount.PENDING:
            messages.error(request, "Loan is not pending.")
            return redirect("..")

        loan.status = LoanAccount.APPROVED
        loan.approved_at = timezone.now()
        loan.save()

        messages.success(request, "Loan approved successfully.")
        return redirect("..")
    
    
    def disburse_loan(self, request, loan_id):
        loan = LoanAccount.objects.get(id=loan_id)

        if loan.status != LoanAccount.APPROVED:
            messages.error(request, "Loan must be approved first.")
            return redirect("..")

        LoanTransaction.objects.create(
            loan=loan,
            transaction_type=LoanTransaction.DISBURSEMENT,
            amount=loan.principal_amount,
            reference=f"DISB-{loan.loan_number}",
            performed_by=request.user,
            narration="Loan disbursement",
        )

        loan.status = LoanAccount.DISBURSED
        loan.disbursed_at = timezone.now()
        loan.outstanding_principal = loan.principal_amount
        loan.save()

        messages.success(request, "Loan disbursed successfully.")
        return redirect("..")

    def repay_loan(self, request, loan_id):
        loan = LoanAccount.objects.get(id=loan_id)

        if loan.status != LoanAccount.DISBURSED:
            self.message_user(request, "Loan is not active.", level=messages.ERROR)
            return redirect("..")

        if request.method == "POST":
            form = LoanRepaymentForm(request.POST)
            if form.is_valid():
                amount = form.cleaned_data["amount"]
                narration = form.cleaned_data["narration"]

                if amount > loan.outstanding_principal:
                    self.message_user(
                        request,
                        "Repayment amount exceeds outstanding balance.",
                        level=messages.ERROR,
                    )
                    return redirect(request.path)

                LoanTransaction.objects.create(
                    loan=loan,
                    transaction_type=LoanTransaction.REPAYMENT,
                    amount=amount,
                    reference=f"REPAY-{loan.loan_number}-{timezone.now().timestamp()}",
                    narration=narration or "Loan repayment",
                    performed_by=request.user,
                )

                loan.outstanding_principal -= amount
                if loan.outstanding_principal <= 0:
                    loan.status = LoanAccount.CLOSED

                loan.save()

                self.message_user(request, "Repayment posted successfully.")
                return redirect(
                    f"/admin/loans/loanaccount/{loan.id}/change/"
                )

        else:
            form = LoanRepaymentForm()

        context = dict(
            self.admin_site.each_context(request),
            form=form,
            loan=loan,
            title="Post Loan Repayment",
        )

        return TemplateResponse(
            request,
            "admin/loans/loanaccount/repay_form.html",
            context,
        )

