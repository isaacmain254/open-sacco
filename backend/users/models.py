from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager


class User(AbstractUser):
    ADMIN = "AD"
    MANAGER = "MA"
    OPERATION = "OP"
    FINANCE = "FI"
    LOAN = "LO"
    ACCOUNTANT = "AC"

    ROLE_CHOICES = (
        (ADMIN, 'Admin'),
        (MANAGER, 'Manager'),
        (OPERATION, 'Operation Manager'),
        (FINANCE, 'Finance Officer'),
        (LOAN, 'Loan Officer'),
        (ACCOUNTANT, 'Accountant'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=2,
        choices=ROLE_CHOICES,
        default=ACCOUNTANT
    )
    profile_image = models.ImageField(
        upload_to='users',
        blank=True,
        null=True
    )

    USERNAME_FIELD = 'email'   # 👈 login with email
    REQUIRED_FIELDS = ['username']  # 👈 still required for superuser

    def __str__(self):
        return self.email

    objects = UserManager()
