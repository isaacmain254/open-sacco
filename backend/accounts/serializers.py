from drf_writable_nested.serializers import WritableNestedModelSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import SavingsAccount, SavingsProduct, SavingsTransaction
from members.models import Member


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsProduct
        fields = ('name',)



class AccountSerializer(WritableNestedModelSerializer):
    product = serializers.SlugRelatedField(slug_field='name', queryset=SavingsProduct.objects.all())
    member = serializers.SlugRelatedField(slug_field='membership_number', queryset=Member.objects.all())
    
    
    class Meta:
        model = SavingsAccount
        exclude = ("opened_at",)
        extra_kwargs = {
            'account_number': {
                'validators': [
                    UniqueValidator(
                        queryset=SavingsAccount.objects.all(),
                        message="An account with this account number already exists."
                    )
                ]
            }
        }


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for reading transaction details"""
    account_number = serializers.CharField(source='account.account_number', read_only=True)
    member = serializers.CharField(source='account.member.membership_number', read_only=True)
    performed_by_username = serializers.CharField(source='performed_by.username', read_only=True)
    
    class Meta:
        model = SavingsTransaction
        fields = [
            'id',
            'account',
            'account_number',
            'member',
            'transaction_type',
            'amount',
            'reference',
            'narration',
            'performed_by',
            'performed_by_username',
            'created_at'
        ]
        read_only_fields = ['id', 'reference', 'created_at']


class TransactionCreateSerializer(serializers.Serializer):
    """Serializer for creating transactions via the API"""
    account_number = serializers.CharField(max_length=20)
    transaction_type = serializers.ChoiceField(choices=SavingsTransaction.TRANSACTION_TYPES)
    amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    narration = serializers.CharField(required=False, allow_blank=True, default="")
    
    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        return value
    
    def validate_account_number(self, value):
        """Ensure account exists"""
        try:
            account = SavingsAccount.objects.get(account_number=value)
            if not account.is_active:
                raise serializers.ValidationError("Account is not active")
        except SavingsAccount.DoesNotExist:
            raise serializers.ValidationError("Account does not exist")
        return value