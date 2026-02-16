from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets,  mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal

from .models import SavingsAccount, SavingsProduct, SavingsTransaction
from .serializers import AccountSerializer, ProductSerializer, TransactionSerializer, TransactionCreateSerializer
from .services import post_savings_transaction
from members.models import Member


class AccountViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):
    """
    A ViewSet for listing and retrieving accounts information
    """
    permission_classes = [IsAuthenticated]
    queryset = SavingsAccount.objects.all()
    serializer_class = AccountSerializer
    lookup_field = "account_number"

    @action(detail=False, methods=['get'], url_path='member/(?P<member_id>[^/.]+)')
    def member_accounts(self, request, member_id=None):
        """
        Get all accounts that belong to a specific member.
        Usage: GET /accounts/member/{member_id}/
        """
        member = get_object_or_404(Member, membership_number=member_id)
        accounts = SavingsAccount.objects.filter(member=member)
        serializer = self.get_serializer(accounts, many=True)
        return Response(serializer.data)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = SavingsProduct.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]


class TransactionViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    """
    A ViewSet for managing transactions with security features.
    
    List: GET /transactions/?account=SA00000001&transaction_type=deposit
    Create: POST /transactions/
    Retrieve: GET /transactions/{id}/
    """
    permission_classes = [IsAuthenticated]
    queryset = SavingsTransaction.objects.select_related('account', 'account__member', 'performed_by').all()
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        """
        Filter transactions by account number and/or transaction type
        """
        queryset = super().get_queryset()
        
        # Filter by account number
        account_number = self.request.query_params.get('account', None)
        if account_number:
            queryset = queryset.filter(account__account_number=account_number)
        
        # Filter by transaction type
        transaction_type = self.request.query_params.get('transaction_type', None)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Create a new transaction using the post_savings_transaction service.
        This ensures all business logic and security measures are applied.
        """
        # Validate input
        serializer = TransactionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Get the account
            account = SavingsAccount.objects.get(
                account_number=serializer.validated_data['account_number']
            )
            
            # Create the transaction using the service
            transaction = post_savings_transaction(
                account=account,
                transaction_type=serializer.validated_data['transaction_type'],
                amount=Decimal(str(serializer.validated_data['amount'])),
                user=request.user,
                narration=serializer.validated_data.get('narration', '')
            )
            
            # Return the created transaction
            output_serializer = TransactionSerializer(transaction)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            
        except SavingsAccount.DoesNotExist:
            return Response(
                {'error': 'Account not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'An error occurred while processing the transaction'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='account/(?P<account_number>[^/.]+)')
    def account_transactions(self, request, account_number=None):
        """
        Get all transactions for a specific account.
        Usage: GET /transactions/account/{account_number}/
        """
        account = get_object_or_404(SavingsAccount, account_number=account_number)
        transactions = SavingsTransaction.objects.filter(account=account).select_related(
            'account', 'account__member', 'performed_by'
        )
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'], url_path='member/(?P<member_id>[^/.]+)')
    def member_transactions(self, request, member_id=None):
        """
        Get all transactions for a specific member.
        Usage: GET /transactions/member/{member_id}
        """
        member = get_object_or_404(Member, membership_number=member_id)
        transactions = SavingsTransaction.objects.filter(account__member=member).select_related(
            'account', 'account__member', 'performed_by'
        )
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)