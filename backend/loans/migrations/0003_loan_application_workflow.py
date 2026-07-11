from decimal import Decimal

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("accounts", "0001_initial"),
        ("loans", "0002_remove_loantransaction_is_reversal_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="loanproduct",
            name="multiplier",
            field=models.DecimalField(decimal_places=2, default=Decimal("3.00"), max_digits=5),
        ),
        migrations.AddField(
            model_name="loanproduct",
            name="repayment_period_months",
            field=models.PositiveIntegerField(default=12),
        ),
        migrations.CreateModel(
            name="LoanApplication",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("application_number", models.CharField(editable=False, max_length=20, unique=True)),
                ("requested_amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("purpose", models.TextField()),
                ("repayment_period_months", models.PositiveIntegerField()),
                ("employer", models.CharField(blank=True, max_length=255)),
                ("payroll_number", models.CharField(blank=True, max_length=100)),
                ("gross_salary", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ("net_salary", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ("security_type", models.CharField(choices=[("self_guarantee", "Self Guarantee"), ("guarantors", "Guarantors"), ("collateral", "Collateral"), ("mixed", "Mixed")], default="self_guarantee", max_length=30)),
                ("collateral_description", models.TextField(blank=True)),
                ("remarks", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("draft", "Draft"), ("submitted", "Submitted"), ("under_review", "Under Review"), ("approved", "Approved"), ("rejected", "Rejected"), ("disbursed", "Disbursed")], default="draft", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("submitted_at", models.DateTimeField(blank=True, null=True)),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("approved_at", models.DateTimeField(blank=True, null=True)),
                ("rejected_at", models.DateTimeField(blank=True, null=True)),
                ("disbursed_at", models.DateTimeField(blank=True, null=True)),
                ("approval_notes", models.TextField(blank=True)),
                ("rejection_reason", models.TextField(blank=True)),
                ("disbursement_notes", models.TextField(blank=True)),
                ("eligibility_warnings", models.JSONField(blank=True, default=list)),
                ("approved_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="approved_loan_applications", to=settings.AUTH_USER_MODEL)),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="created_loan_applications", to=settings.AUTH_USER_MODEL)),
                ("disbursed_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="disbursed_loan_applications", to=settings.AUTH_USER_MODEL)),
                ("loan_type", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="applications", to="loans.loanproduct")),
                ("member", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="loan_applications", to="members.member")),
                ("rejected_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="rejected_loan_applications", to=settings.AUTH_USER_MODEL)),
                ("reviewed_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="reviewed_loan_applications", to=settings.AUTH_USER_MODEL)),
                ("submitted_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="submitted_loan_applications", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="LoanApplicationDocument",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("document_type", models.CharField(max_length=100)),
                ("file", models.FileField(upload_to="loan-applications/")),
                ("uploaded_at", models.DateTimeField(auto_now_add=True)),
                ("application", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="documents", to="loans.loanapplication")),
                ("uploaded_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="uploaded_loan_documents", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-uploaded_at"]},
        ),
        migrations.CreateModel(
            name="LoanApplicationGuarantor",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("guaranteed_amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("application", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="guarantors", to="loans.loanapplication")),
                ("member", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="guaranteed_loan_applications", to="members.member")),
            ],
            options={"ordering": ["created_at"], "unique_together": {("application", "member")}},
        ),
        migrations.AddField(
            model_name="loanaccount",
            name="application",
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="loan_account", to="loans.loanapplication"),
        ),
    ]