# savings/admin.py
from django.urls import path
from django.contrib import admin
from django.shortcuts import render, redirect
from django.contrib import messages
from decimal import Decimal

from .models import SavingsProduct, SavingsAccount, SavingsTransaction
from .forms import SavingsTransactionForm
from .services import post_savings_transaction

@admin.register(SavingsProduct)
class SavingsProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "interest_rate",
        "minimum_balance",
        "allows_withdrawals",
        "is_active",
    )

    list_filter = ("is_active", "allows_withdrawals")
    search_fields = ("name", "code")


class SavingsTransactionInline(admin.TabularInline):
    model = SavingsTransaction
    extra = 0
    can_delete = False

    readonly_fields = (
        "transaction_type",
        "amount",
        "reference",
        "performed_by",
        "created_at",
        "narration",
    )

    def has_add_permission(self, request, obj=None):
        return False
    

@admin.register(SavingsAccount)
class SavingsAccountAdmin(admin.ModelAdmin):
    list_display = (
        "account_number",
        "member",
        "product",
        "balance",
        "is_active",
        "opened_at",
    )

    list_filter = ("product", "is_active")
    search_fields = (
        "account_number",
        "member__membership_number",
        "member__first_name",
        "member__last_name",
    )

    readonly_fields = (
        "account_number",
        "balance",
        "opened_at",
    )

    fieldsets = (
        ("Account Info", {
            "fields": (
                "account_number",
                "member",
                "product",
                "is_active",
            )
        }),
        ("Financials", {
            "fields": (
                "balance",
                "opened_at",
            )
        }),
    )

    inlines = [SavingsTransactionInline]

    def has_delete_permission(self, request, obj=None):
        return False

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "<int:account_id>/post-transaction/",
                self.admin_site.admin_view(self.post_transaction_view),
                name="savingsaccount_post_transaction",
            ),
        ]
        return custom_urls + urls
    
    def post_transaction_view(self, request, account_id):
        account = SavingsAccount.objects.get(id=account_id)

        if not account.is_active:
            messages.error(request, "Account is inactive.")
            return redirect("..")

        if request.method == "POST":
            form = SavingsTransactionForm(request.POST)
            if form.is_valid():
                try:
                    post_savings_transaction(
                        account=account,
                        transaction_type=form.cleaned_data["transaction_type"],
                        amount=form.cleaned_data["amount"],
                        user=request.user,
                        narration=form.cleaned_data.get("narration", "")
                    )
                    messages.success(
                        request, "Transaction posted successfully.")
                    return redirect(
                        f"/admin/accounts/savingsaccount/{account.id}/change/"
                    )
                except Exception as e:
                    messages.error(request, str(e))
        else:
            form = SavingsTransactionForm()

        context = {
            "form": form,
            "account": account,
            "title": "Post Deposit / Withdrawal",
        }
        return render(request, "admin/accounts/post_transaction.html", context)

    

@admin.register(SavingsTransaction)
class SavingsTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "account",
        "transaction_type",
        "amount",
        "performed_by",
        "created_at",
    )

    list_filter = ("transaction_type", "created_at")
    search_fields = (
        "reference",
        "account__account_number",
        "account__member__membership_number",
    )

    readonly_fields = (
        "account",
        "transaction_type",
        "amount",
        "reference",
        "performed_by",
        "created_at",
        "narration",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
