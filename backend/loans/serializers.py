from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers

from accounts.models import SavingsAccount
from members.models import Member

from .models import (
    LoanAccount,
    LoanApplication,
    LoanApplicationDocument,
    LoanApplicationGuarantor,
    LoanProduct,
)
from .services import build_eligibility_summary


class LoanTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanProduct
        fields = [
            "id",
            "name",
            "interest_rate",
            "repayment_period_months",
            "multiplier",
            "interest_type",
            "min_amount",
            "max_amount",
            "max_term_months",
            "requires_guarantors",
            "is_active",
        ]


class LoanApplicationGuarantorSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField(read_only=True)
    member = serializers.SlugRelatedField(
        slug_field="membership_number",
        queryset=Member.objects.all(),
    )

    class Meta:
        model = LoanApplicationGuarantor
        fields = [
            "id",
            "member",
            "member_name",
            "guaranteed_amount",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "member_name"]

    def get_member_name(self, obj):
        return f"{obj.member.first_name} {obj.member.last_name}".strip()

    def validate_guaranteed_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Guaranteed amount must be greater than zero.")
        return value

    def validate(self, attrs):
        """A member may guarantee their own application only up to their deposits."""
        application = self.context.get("application")
        guarantor = attrs.get("member")

        if application and guarantor and guarantor.pk == application.member_id:
            deposits = (
                SavingsAccount.objects.filter(member=guarantor)
                .aggregate(total=Sum("balance"))
                .get("total")
                or Decimal("0.00")
            )
            if application.requested_amount > deposits:
                raise serializers.ValidationError({
                    "member": "The applicant can only self-guarantee when their deposits cover the requested amount."
                })

        return attrs


class LoanApplicationDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source="uploaded_by.username", read_only=True)

    class Meta:
        model = LoanApplicationDocument
        fields = [
            "id",
            "document_type",
            "file",
            "uploaded_by",
            "uploaded_by_username",
            "uploaded_at",
        ]
        read_only_fields = ["id", "uploaded_by", "uploaded_by_username", "uploaded_at"]


class LoanAccountSerializer(serializers.ModelSerializer):
    member = serializers.CharField(source="member.membership_number", read_only=True)
    product = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = LoanAccount
        fields = [
            "loan_number",
            "member",
            "product",
            "principal_amount",
            "interest_rate",
            "term_months",
            "approved_at",
            "disbursed_at",
            "status",
            "outstanding_principal",
            "outstanding_interest",
            "created_at",
        ]


class LoanApplicationListSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    member_number = serializers.CharField(source="member.membership_number", read_only=True)
    loan_type_name = serializers.CharField(source="loan_type.name", read_only=True)
    loan_officer = serializers.CharField(source="created_by.username", read_only=True)
    approver = serializers.CharField(source="approved_by.username", read_only=True)

    class Meta:
        model = LoanApplication
        fields = [
            "application_number",
            "member",
            "member_number",
            "member_name",
            "loan_type",
            "loan_type_name",
            "requested_amount",
            "status",
            "created_at",
            "loan_officer",
            "approver",
        ]

    def get_member_name(self, obj):
        return f"{obj.member.first_name} {obj.member.last_name}".strip()


class LoanApplicationDetailSerializer(serializers.ModelSerializer):
    member = serializers.SlugRelatedField(slug_field="membership_number", queryset=Member.objects.all())
    member_name = serializers.SerializerMethodField(read_only=True)
    member_summary = serializers.SerializerMethodField(read_only=True)
    loan_type = serializers.PrimaryKeyRelatedField(queryset=LoanProduct.objects.filter(is_active=True))
    loan_type_name = serializers.CharField(source="loan_type.name", read_only=True)
    guarantors = LoanApplicationGuarantorSerializer(many=True, read_only=True)
    documents = LoanApplicationDocumentSerializer(many=True, read_only=True)
    loan_account = LoanAccountSerializer(read_only=True)
    eligibility_summary = serializers.SerializerMethodField(read_only=True)
    audit_log = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LoanApplication
        fields = [
            "application_number",
            "member",
            "member_name",
            "member_summary",
            "loan_type",
            "loan_type_name",
            "requested_amount",
            "purpose",
            "repayment_period_months",
            "employer",
            "payroll_number",
            "gross_salary",
            "net_salary",
            "security_type",
            "collateral_description",
            "remarks",
            "status",
            "created_by",
            "submitted_by",
            "reviewed_by",
            "approved_by",
            "rejected_by",
            "disbursed_by",
            "created_at",
            "submitted_at",
            "reviewed_at",
            "approved_at",
            "rejected_at",
            "disbursed_at",
            "approval_notes",
            "rejection_reason",
            "disbursement_notes",
            "eligibility_warnings",
            "eligibility_summary",
            "guarantors",
            "documents",
            "loan_account",
            "audit_log",
        ]
        read_only_fields = [
            "application_number",
            "status",
            "created_by",
            "submitted_by",
            "reviewed_by",
            "approved_by",
            "rejected_by",
            "disbursed_by",
            "created_at",
            "submitted_at",
            "reviewed_at",
            "approved_at",
            "rejected_at",
            "disbursed_at",
            "approval_notes",
            "rejection_reason",
            "disbursement_notes",
            "eligibility_warnings",
            "loan_account",
            "audit_log",
            "member_summary",
            "eligibility_summary",
            "member_name",
            "loan_type_name",
        ]

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        loan_type = attrs.get("loan_type") or getattr(instance, "loan_type", None)
        requested_amount = attrs.get("requested_amount")
        repayment_period = attrs.get("repayment_period_months")

        if instance and instance.status != LoanApplication.Status.DRAFT:
            raise serializers.ValidationError("Only draft applications can be edited.")

        if loan_type and requested_amount is not None:
            if requested_amount < loan_type.min_amount or requested_amount > loan_type.max_amount:
                raise serializers.ValidationError({
                    "requested_amount": "Requested amount is outside the selected loan type limits.",
                })

        if loan_type and repayment_period is not None and repayment_period > loan_type.max_term_months:
            raise serializers.ValidationError({
                "repayment_period_months": "Repayment period exceeds the selected loan type maximum term.",
            })

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        return LoanApplication.objects.create(created_by=request.user, **validated_data)

    def get_member_name(self, obj):
        return f"{obj.member.first_name} {obj.member.last_name}".strip()

    def get_member_summary(self, obj):
        deposits = obj.member.accounts.aggregate(total=Sum("balance")).get("total") or Decimal("0.00")
        outstanding_balance = (
            LoanAccount.objects.filter(
                member=obj.member,
                status__in=[LoanAccount.APPROVED, LoanAccount.DISBURSED, LoanAccount.DEFAULTED],
            ).aggregate(total=Sum("outstanding_principal"))
            .get("total")
            or Decimal("0.00")
        )
        return {
            "membership_number": obj.member.membership_number,
            "name": self.get_member_name(obj),
            "membership_date": obj.member.date_joined,
            "deposits": deposits,
            "existing_loans": LoanAccount.objects.filter(
                member=obj.member,
                status__in=[LoanAccount.APPROVED, LoanAccount.DISBURSED, LoanAccount.DEFAULTED],
            ).count(),
            "outstanding_balance": outstanding_balance,
        }

    def get_eligibility_summary(self, obj):
        return build_eligibility_summary(obj)

    def get_audit_log(self, obj):
        return [
            {"event": "created", "at": obj.created_at, "by": getattr(obj.created_by, "username", None)},
            {"event": "submitted", "at": obj.submitted_at, "by": getattr(obj.submitted_by, "username", None)},
            {"event": "under_review", "at": obj.reviewed_at, "by": getattr(obj.reviewed_by, "username", None)},
            {"event": "approved", "at": obj.approved_at, "by": getattr(obj.approved_by, "username", None)},
            {"event": "rejected", "at": obj.rejected_at, "by": getattr(obj.rejected_by, "username", None)},
            {"event": "disbursed", "at": obj.disbursed_at, "by": getattr(obj.disbursed_by, "username", None)},
        ]


class LoanSubmissionSerializer(serializers.Serializer):
    def save(self, **kwargs):
        return self.instance


class LoanApprovalSerializer(serializers.Serializer):
    approval_notes = serializers.CharField(required=False, allow_blank=True, default="")


class LoanRejectionSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=True, allow_blank=False)


class LoanDisbursementSerializer(serializers.Serializer):
    account_number = serializers.CharField(max_length=20)
    disbursement_notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_account_number(self, value):
        try:
            account = SavingsAccount.objects.select_related("member").get(account_number=value)
        except SavingsAccount.DoesNotExist as exc:
            raise serializers.ValidationError("Account does not exist.") from exc

        if not account.is_active:
            raise serializers.ValidationError("Account is not active.")

        application = self.context["application"]
        if account.member_id != application.member_id:
            raise serializers.ValidationError("Disbursement account must belong to the application member.")

        self.context["account"] = account
        return value
