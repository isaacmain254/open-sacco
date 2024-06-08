from django.db import models
from django.contrib.auth.models import User


# class Profile(models.Model):
#     ADMIN = 1
#     MANAGER = 2
#     OPERATION = 3
#     FINANCE = 4
#     LOAN = 5
#     ACCOUNTANT = 6
#     ROLE_CHOICES = (
#         (ADMIN, 'Admin'),
#         (MANAGER, 'Manager'),
#         (OPERATION, 'Operation Manager'),
#         (FINANCE, 'Finance Officer'),
#         (LOAN, 'Loan Officer'),
#         (ACCOUNTANT, 'Accountant'),
#     )
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     roles = models.PositiveSmallIntegerField(
#         choices=ROLE_CHOICES, default=ACCOUNTANT)
