
from django.contrib import admin
from .models import Member, NextOfKin, EmploymentDetail, KYCDocument


class NextOfKinInline(admin.TabularInline):
    model = NextOfKin
    extra = 1


class EmploymentDetailInline(admin.StackedInline):
    model = EmploymentDetail
    extra = 0


class KYCDocumentInline(admin.TabularInline):
    model = KYCDocument
    extra = 0
    readonly_fields = ("uploaded_at", "verified_by")


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = (
        "membership_number",
        "first_name",
        "last_name",
        "phone_number",
        "status",
        "kyc_status",
        "date_joined",
    )

    list_filter = ("status",)
    search_fields = (
        "membership_number",
        "first_name",
        "last_name",
        "national_id",
        "phone_number",
    )

    readonly_fields = ("created_at", "updated_at", "membership_number")

    fieldsets = (
        ("Membership Info", {
            "fields": ("membership_number", "status", "date_joined")
        }),
        ("Personal Details", {
            "fields": (
                "salutation",
                "first_name",
                "middle_name",
                "last_name",
                "national_id",
                "phone_number",
                "email",
                # "address",
                "date_of_birth",
                "kra_pin"
            )
        }),
        ("Address", {"fields": ("country", "county", "city")}),
        ("System Info", {
            "fields": ("created_at", "updated_at")
        }),
    )

    inlines = [
        NextOfKinInline,
        EmploymentDetailInline,
        KYCDocumentInline,
    ]

    def kyc_status(self, obj):
        return "✅ Complete" if obj.is_kyc_complete() else "❌ Incomplete"

    kyc_status.short_description = "KYC Status"
