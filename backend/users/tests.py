from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

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


class ChangePasswordViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="password@example.com",
            username="password-user",
            password="old-password-123",
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_change_password_requires_current_password_and_updates_password(self):
        response = self.client.post(
            "/api/v1/auth/change-password",
            {"current_password": "old-password-123", "new_password": "new-password-123"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("new-password-123"))


class RoleAccessControlAPITest(TestCase):
    """The API policy is the source of truth; the UI only mirrors this policy."""

    def setUp(self):
        self.client = APIClient()
        self.users = {
            role: User.objects.create_user(
                email=f"{role.lower()}@example.com",
                username=role.lower(),
                password="test-password-123",
                role=role,
            )
            for role in (
                User.ADMIN,
                User.MANAGER,
                User.OPERATION,
                User.FINANCE,
                User.LOAN,
                User.ACCOUNTANT,
            )
        }

    def get_as(self, role, url):
        self.client.force_authenticate(self.users[role])
        return self.client.get(url)

    def test_module_reads_follow_the_role_matrix(self):
        module_urls = {
            "/api/v1/members/": {User.ADMIN, User.MANAGER, User.OPERATION, User.FINANCE, User.LOAN, User.ACCOUNTANT},
            "/api/v1/accounts/": {User.ADMIN, User.MANAGER, User.OPERATION, User.FINANCE, User.LOAN, User.ACCOUNTANT},
            "/api/v1/transactions/": {User.ADMIN, User.MANAGER, User.OPERATION, User.FINANCE, User.LOAN, User.ACCOUNTANT},
            "/api/v1/products/": {User.ADMIN, User.MANAGER, User.OPERATION, User.FINANCE, User.LOAN, User.ACCOUNTANT},
            "/api/v1/loans/": {User.ADMIN, User.MANAGER, User.OPERATION, User.LOAN},
            "/api/v1/auth/users/": {User.ADMIN, User.MANAGER},
        }

        for url, allowed_roles in module_urls.items():
            for role in self.users:
                with self.subTest(url=url, role=role):
                    response = self.get_as(role, url)
                    self.assertEqual(response.status_code, 200 if role in allowed_roles else 403)

    def test_only_admins_and_managers_can_create_account_products(self):
        payload = {
            "name": "Junior Savings",
            "code": "JNR",
            "minimum_balance": "100.00",
            "interest_rate": "2.50",
            "withdrawal_fee": "0.00",
            "allows_withdrawals": True,
            "is_active": True,
        }

        for role in self.users:
            with self.subTest(role=role):
                self.client.force_authenticate(self.users[role])
                response = self.client.post("/api/v1/products/", payload, format="json")
                expected = 201 if role in {User.ADMIN, User.MANAGER} else 403
                self.assertEqual(response.status_code, expected)

                if response.status_code == 201:
                    payload["code"] = f"JNR-{role}"
                    payload["name"] = f"Junior Savings {role}"

    def test_only_admins_and_managers_can_provision_users(self):
        payload = {
            "username": "new-loan-officer",
            "email": "new-loan-officer@example.com",
            "password": "test-password-123",
            "confirm_password": "test-password-123",
            "role": User.LOAN,
        }

        self.client.force_authenticate(self.users[User.LOAN])
        self.assertEqual(self.client.post("/api/v1/auth/register", payload, format="json").status_code, 403)

        self.client.force_authenticate(self.users[User.MANAGER])
        response = self.client.post("/api/v1/auth/register", payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.get(email=payload["email"]).role, User.LOAN)

    def test_current_user_endpoint_only_returns_the_authenticated_user(self):
        self.client.force_authenticate(self.users[User.ACCOUNTANT])
        response = self.client.get("/api/v1/auth/me")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.users[User.ACCOUNTANT].id)
