# Generated by Django 4.2.13 on 2024-06-20 21:46

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('users', '0002_profile_profile_image_alter_profile_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='role',
            field=models.CharField(choices=[('FI', 'Finance Officer'), ('LO', 'Loan Officer'), ('MA', 'Manager'), ('AD', 'Admin'), ('AC', 'Accountant'), ('OP', 'Operation Manager')], default='AC', max_length=2),
        ),
        migrations.AlterField(
            model_name='profile',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='user', to=settings.AUTH_USER_MODEL),
        ),
    ]
