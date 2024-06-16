from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    ADMIN = "AD"
    MANAGER = "MA"
    OPERATION = "OP"
    FINANCE = "FI"
    LOAN = "LO"
    ACCOUNTANT = "AC"
    ROLE_CHOICES = {
        (ADMIN, 'Admin'),
        (MANAGER, 'Manager'),
        (OPERATION, 'Operation Manager'),
        (FINANCE, 'Finance Officer'),
        (LOAN, 'Loan Officer'),
        (ACCOUNTANT, 'Accountant'),
    }
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=2,
                            choices=ROLE_CHOICES, default=ACCOUNTANT)
    profile_image = models.ImageField(
        upload_to='users', blank=True, null=True)

    def __str__(self):
        return self.user.username
