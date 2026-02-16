from drf_writable_nested.serializers import WritableNestedModelSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import Member, NextOfKin, EmploymentDetail, KYCDocument


class NextOfKinSerializer(serializers.ModelSerializer):
    class Meta:
        model = NextOfKin
        exclude = ("member", "created_at")


class EmploymentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentDetail
        exclude = ("member", "created_at")


class KYCDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCDocument
        exclude = ("member", "uploaded_at")


class MemberSerializer(WritableNestedModelSerializer):
    next_of_kin = NextOfKinSerializer(many=True)
    employment = EmploymentDetailSerializer(many=False)
    kyc_documents = KYCDocumentSerializer(many=True)

    class Meta:
        model = Member
        exclude = ("date_joined", "created_at", "updated_at")
        # Fix  UniqueValidator error on national_id field on instance update
        # Allow DRF to handle it automatically
        extra_kwargs = {
            'national_id': {
                'validators': [
                    # UniqueValidator(
                    #     queryset=Member.objects.all(),
                    #     message="A member with this national ID already exists."
                    # )
                ]
            }
        }
