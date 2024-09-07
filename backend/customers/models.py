from django.db import models
from django.utils.translation import gettext_lazy as _
import datetime
import random
import uuid


class Customer(models.Model):
    class Salutation(models.TextChoices):
        MR = 'Mr', _('Mr.')
        MRS = 'Mrs', _('Mrs.')
        MS = 'Ms', _('Ms.')
        DR = 'Dr.', _('Dr.')
        PROF = 'Prof.', _('Prof.')
        REV = 'Rev.', _('Rev.')

    salutation = models.CharField(
        max_length=5, choices=Salutation.choices, default=Salutation.MR)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=100)
    email = models.EmailField()
    date_of_birth = models.DateField()
    tax_number = models.CharField(max_length=100)
    # Address
    country = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    po_box = models.IntegerField()

    def __str__(self):
        return self.first_name


class Account(models.Model):
    # account type Enums
    class AccountType(models.TextChoices):
        SAVINGS = 'Savings', _('Savings')
        CURRENT = 'Current', _('Current')
        FIXED = 'Fixed', _('Fixed')
        JOINT = 'Joint', _('Joint')
        CORPORATE = 'Corporate', _('Corporate')

    # account status Enums
    class AccountStatus(models.TextChoices):
        ACTIVE = 'Active', _('Active')
        CLOSED = 'Closed', _('Closed')
        DORMANT = 'Dormant', _('Dormant')
        SUSPENDED = 'Suspended', _('Suspended')

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    account_number = models.CharField(
        max_length=50, primary_key=True, editable=False, unique=True)
    # Add account name choices field
    # account_name = models.CharField(max_length=100)
    account_type = models.CharField(
        max_length=50, choices=AccountType.choices, default=AccountType.SAVINGS)
    balance = models.DecimalField(
        max_digits=13, decimal_places=2, default=0.00)
    date_opened = models.DateField(auto_now_add=True)
    status = models.CharField(
        max_length=50, choices=AccountStatus.choices, default=AccountStatus.ACTIVE)

    def __str__(self):
        return self.account_number

    def save(self, *args, **kwargs):
        if not self.account_number:
            self.account_number = self.generate_account_number()
        super(Account, self).save(*args, **kwargs)

    def generate_account_number(self):
        today = datetime.date.today()
        year, month, date = str(today).split('-')
        date_without_hyphen = ''.join([year, month, date])
        random_number = random.randint(10, 99)
        return f'{date_without_hyphen}{random_number}'


class Transaction(models.Model):
    class TransactionType(models.TextChoices):
        DEPOSIT = 'Deposit', _('Deposit')
        WITHDRAWAL = 'Withdrawal', _('Withdrawal')
        TRANSFER = 'Transfer', _('Transfer')
        PAYMENT = 'Payment', _('Payment')

    transaction_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    transaction_type = models.CharField(
        max_length=50, choices=TransactionType.choices, default=TransactionType.DEPOSIT)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateField(auto_now_add=True)
    description = models.TextField()
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    served_by = models.CharField(max_length=50)

    class Meta:
        ordering = ['-transaction_date']

    def __str__(self):
        return self.transaction_id

    def save(self, *args, **kwargs):
        if self.transaction_type == self.TransactionType.DEPOSIT:
            self.account.balance += self.amount
        elif self.transaction_type == self.TransactionType.WITHDRAWAL:
            self.account.balance -= self.amount
        self.account.save()
        super(Transaction, self).save(*args, **kwargs)


class Loan(models.Model):
    class LoanType(models.TextChoices):
        EMERGENCY = 'Emergency', _('Emergency')
        EDUCATION = 'Education', _('Education')
        PERSONAL = 'Personal', _('Personal')
        DEVELOPMENT = 'Development', _('Development')

    class LoanStatus(models.TextChoices):
        APPROVED = 'Approved', _('Approved')
        DISBURSED = 'Disbursed', _('Disbursed')
        ACTIVE = 'Active', _('Active')
        CLOSED = 'Closed', _('Closed')

    loan_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    loan_type = models.CharField(
        max_length=50, choices=LoanType.choices, default=LoanType.PERSONAL)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    loan_balance = models.DecimalField(max_digits=10, decimal_places=2)
    # interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    loan_status = models.CharField(
        max_length=50, choices=LoanStatus.choices, default=LoanStatus.APPROVED)
    date_approved = models.DateField(auto_now_add=True)
    # date_due = models.DateField()
    # date_closed = models.DateField()

    class Meta:
        ordering = ['-date_approved']
