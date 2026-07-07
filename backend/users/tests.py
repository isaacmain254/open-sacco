from django.core.management import call_command
from django.test import TestCase

from accounts.models import SavingsProduct
from customers.models import Customer
from loans.models import LoanProduct
from members.models import Member
from .models import User


class SeedDataCommandTest(TestCase):
    def test_seed_demo_data_creates_sample_records(self):
        call_command("seed_demo_data", verbosity=0)

        self.assertTrue(User.objects.filter(email="admin@example.com").exists())
        self.assertTrue(Member.objects.exists())
        self.assertTrue(Customer.objects.exists())
        self.assertTrue(SavingsProduct.objects.exists())
        self.assertTrue(LoanProduct.objects.exists())
