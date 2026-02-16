
import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'open_sacco.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from members.models import Member
from rest_framework.test import APIClient
import json

def run_test():
    User = get_user_model()
    # Create or get admin user
    user, created = User.objects.get_or_create(username='testadmin_update')
    if created:
        user.set_password('password')
        user.save()

    # Create a member to test update
    # Cleanup first
    Member.objects.filter(national_id='99999999').delete()
    
    member = Member.objects.create(
        first_name='Update',
        last_name='Test',
        national_id='99999999',
        phone_number='0799999999',
        date_of_birth='1990-01-01',
        kra_pin='A999999999Z',
        country='Kenya',
        county='Nairobi',
        city='Nairobi'
    )
    print(f"Created member: Membership No={member.membership_number}, ID={member.id}")

    client = APIClient()
    client.force_authenticate(user=user)

    # Try to update the member (PUT)
    # We update a field like first_name, but keep national_id same (or don't send it, but PUT usually requires all or default)
    # Since it's PUT, we sending all required fields.
    
    data = {
        "salutation": "Mr",
        "first_name": "UpdateModified",
        "middle_name": "Test",
        "last_name": "Member",
        "national_id": "99999999", # Same ID
        "phone_number": "0799999999",
        "email": "update@test.com",
        "date_of_birth": "1990-01-01",
        "kra_pin": "A999999999Z",
        "country": "Kenya",
        "county": "Nairobi",
        "city": "Nairobi",
        "status": "Active",
        "employment": {
            "employment_type": "EMPLOYED",
            "employer_name": "Test Corp",
            "job_title": "Tester",
            "monthly_income": 50000
        },
        "next_of_kin": [],
        "kyc_documents": []
    }
    
    print(f"\nTesting PUT to /api/members/{member.membership_number}/")
    # Note: user changed URL to be members/<membership_number>/ so we use that. 
    # Current urls.py seems to be under 'api/' usually, let's assume valid URL from previous context or just try root
    # The user edited backend/members/urls.py. The project likely includes this under /api/ or similar. 
    # Let's try /api/members/ first as per common convention in this project (seen in other files).
    
    url = f'/api/members/{member.membership_number}/'
    response = client.put(url, data, format='json')
    
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        print("Response:", json.dumps(response.data, indent=2))
    else:
        print("Update Successful")

if __name__ == '__main__':
    try:
        run_test()
    except Exception as e:
        print(f"Error: {e}")
