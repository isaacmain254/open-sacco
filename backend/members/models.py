from django.db import models, transaction
from django.utils.translation import gettext_lazy as _
import uuid
from django.utils import timezone
from django.conf import settings


class MemberSequence(models.Model):
    last_value = models.PositiveIntegerField(default=0)


def generate_membership_number():
    """
    Generate membership number
    """
    seq, _ = MemberSequence.objects.select_for_update().get_or_create(id=1)
    seq.last_value += 1
    seq.save()
    return f"M{seq.last_value:06d}"


class Member(models.Model):
    """
    Member/Customer model contains personal details, membership number and status life cycle
    """
    class Salutation(models.TextChoices):
        MR = 'Mr', _('Mr.')
        MRS = 'Mrs', _('Mrs.')
        MS = 'Ms', _('Ms.')
        DR = 'Dr', _('Dr.')
        PROF = 'Prof', _('Prof.')
        REV = 'Rev', _('Rev.')

    class Status(models.TextChoices):
        ACTIVE = 'Active', _('Active')
        CLOSED = 'Closed', _('Closed')
        DORMANT = 'Dormant', _('Dormant')
        SUSPENDED = 'Suspended', _('Suspended')
        PENDING = 'Pending', _("Pending")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Membership details
    membership_number = models.CharField(
        max_length=20, unique=True, editable=False)

    # Personal details
    salutation = models.CharField(
        max_length=5, choices=Salutation.choices, default=Salutation.MR)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    national_id = models.CharField(max_length=20, unique=True)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    date_of_birth = models.DateField()
    kra_pin = models.CharField(max_length=100)
    # Address
    country = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    city = models.CharField(max_length=100)

    # Status
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE
    )

    # Dates
    date_joined = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_kyc_complete(self):
        required = {"NATIONAL_ID", "PASSPORT_PHOTO", "SIGNATURE"}
        uploaded = set(
            self.kyc_documents.filter(verified=True)
            .values_list("document_type", flat=True)
        )
        return required.issubset(uploaded)

    def save(self, *args, **kwargs):
        if not self.membership_number:
            with transaction.atomic():
                self.membership_number = generate_membership_number()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["membership_number"]

    def __str__(self):
        return self.first_name


class NextOfKin(models.Model):
    """
    NextOfKin model supports multiple next of kin 
    """
    member = models.ForeignKey(
        Member, on_delete=models.CASCADE, related_name="next_of_kin"
    )

    name = models.CharField(max_length=200)
    relationship = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    national_id = models.CharField(max_length=20, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.relationship})"


class EmploymentDetail(models.Model):
    """
    Members employment details:
    - Salaried members
    - Business owner 
    - Self-employed members
    """

    EMPLOYMENT_TYPE_CHOICES = (
        ("EMPLOYED", "Employed"),
        ("SELF_EMPLOYED", "Self Employed"),
        ("BUSINESS", "Business Owner"),
        ("UNEMPLOYED", "Unemployed"),
    )

    member = models.OneToOneField(
        Member, on_delete=models.CASCADE, related_name="employment"
    )

    employment_type = models.CharField(
        max_length=20, choices=EMPLOYMENT_TYPE_CHOICES
    )

    employer_name = models.CharField(max_length=255, blank=True, null=True)
    job_title = models.CharField(max_length=255, blank=True, null=True)
    monthly_income = models.DecimalField(
        max_digits=12, decimal_places=2, blank=True, null=True
    )

    business_name = models.CharField(max_length=255, blank=True, null=True)
    business_type = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.member} - {self.employment_type}"


def kyc_upload_path(instance, filename):
    return f"kyc/{instance.member.membership_number}/{filename}"


class KYCDocument(models.Model):
    """
    KYCDocument supports: ID upload, Passport photo, Signature
    A member is considered KYC-complete when:
    - All required document types exist
    - All are verified
    Stuff member reviews uploaded documents, confirms correctness, marks them as verified = True. System records verified_by, uploaded_at
    """
    DOCUMENT_TYPE_CHOICES = (
        ("NATIONAL_ID", "National ID"),
        ("PASSPORT_PHOTO", "Passport Photo"),
        ("SIGNATURE", "Signature"),
    )

    member = models.ForeignKey(
        Member, on_delete=models.CASCADE, related_name="kyc_documents"
    )

    document_type = models.CharField(
        max_length=30, choices=DOCUMENT_TYPE_CHOICES
    )

    file = models.FileField(upload_to=kyc_upload_path)

    verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_kyc_documents",
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.member} - {self.document_type}"
