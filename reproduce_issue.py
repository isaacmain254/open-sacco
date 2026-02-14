import os
import django
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from accounts.models import SavingsAccount, SavingsProduct
from accounts.serializers import AccountSerializer
from members.models import Member
from django.contrib.auth import get_user_model

def run_test():
    # Setup data
    User = get_user_model()
    user = User.objects.first()
    if not user:
        user = User.objects.create(username="testuser", password="password")
        
    member = Member.objects.first()
    if not member:
        member = Member.objects.create(
            first_name="John",
            last_name="Doe",
            id_number="12345678",
            phone_number="0700000000"
        )

    product_name = "Gold Saver"
    product, _ = SavingsProduct.objects.get_or_create(
        name=product_name,
        defaults={
            "code": "GS001",
            "minimum_balance": 1000,
            "interest_rate": 5,
            "allows_withdrawals": True
        }
    )

    # 1. Test Read (Serialize)
    account = SavingsAccount.objects.create(
        member=member,
        product=product,
    )
    
    print(f"Created account: {account}")
    
    serializer = AccountSerializer(account)
    print(f"Serialized product field: {serializer.data['product']}")
    
    if serializer.data['product'] == product_name:
        print("SUCCESS: Product name is displayed.")
    else:
        print(f"FAILURE: Product name is NOT displayed. Got: {serializer.data['product']}")

    # 2. Test Write (Deserialize)
    # Only if generic views are used, we need to ensure the serializer supports writing.
    # We'll try to validate data payload for a new account.
    
    data = {
        "member": member.id,
        "product": product_name, # Sending name
        "balance": 5000
    }
    
    write_serializer = AccountSerializer(data=data)
    if write_serializer.is_valid():
        print("SUCCESS: Serializer is valid with product name.")
        # Clean up
        account.delete()
    else:
        print(f"FAILURE: Serializer is invalid with product name. Errors: {write_serializer.errors}")
        account.delete()
        
        # Try with ID to see if it accepts ID
        data_id = {
            "member": member.id,
            "product": product.id,
            "balance": 5000
        }
        write_serializer_id = AccountSerializer(data=data_id)
        if write_serializer_id.is_valid():
            print("INFO: Serializer accepts ID.")
        else:
            print(f"INFO: Serializer does not accept ID either (or other errors). Errors: {write_serializer_id.errors}")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"An error occurred: {e}")
