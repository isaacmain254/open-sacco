from drf_writable_nested.serializers import WritableNestedModelSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from drf_writable_nested.mixins import UniqueFieldsMixin

from .models import Member, NextOfKin, EmploymentDetail, KYCDocument


class NextOfKinSerializer(serializers.ModelSerializer):
    class Meta:
        model = NextOfKin
        exclude = ("member",)


class EmploymentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentDetail
        fields = '__all__'


class KYCDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCDocument
        fields = '__all__'


# class MemberSerializer(serializers.ModelSerializer):
#     next_of_kin = NextOfKinSerializer(many=True, read_only=True)
#     employment = EmploymentDetailSerializer(read_only=True)
#     kyc_documents = KYCDocumentSerializer(many=True, read_only=True)

#     class Meta:
#         model = Member
#         fields = '__all__'

#FIXME: Update throws an error because national_id field is unique
class MemberSerializer(WritableNestedModelSerializer):
    next_of_kin = NextOfKinSerializer(many=True)

    class Meta:
        model = Member
        exclude = ("date_joined", "created_at", "updated_at")
