from django.shortcuts import render, HttpResponse
from rest_framework import viewsets

from .models import Customer, Account, Transaction, Loan
from .serializers import CustomerSerializer, AccountSerializer, TransactionSerializer, LoanSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def get_queryset(self):
        queryset = Account.objects.all()
        customer_id = self.request.query_params.get('customer_id')
        if customer_id:
            queryset = queryset.filter(customer=customer_id)
        return queryset


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.all()
        account_number = self.request.query_params.get('account_number')
        customer_id = self.request.query_params.get('customer_id')
        # get all transactions for a particular account
        if account_number:
            queryset = queryset.filter(account=account_number)
        # get all transactions for a particular customer
        elif customer_id:
            queryset = queryset.filter(account__customer=customer_id)
        return queryset


class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer

    def get_queryset(self):
        queryset = Loan.objects.all()
        account_number = self.request.query_params.get('account_number')
        customer_id = self.request.query_params.get('customer_id')
        # get all loans for a particular customer
        if customer_id:
            queryset = queryset.filter(account__customer=customer_id)
        # get all loans for a particular account
        elif account_number:
            queryset = queryset.filter(account=account_number)
        return queryset
