from django.contrib import admin

from .models import Customer, Account


class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name',
                    'email', 'phone_number')
    list_display_links = ('id', 'first_name')
    search_fields = ('id', 'first_name', 'middle_name', 'last_name',)
    # list_per_page = 25


class AccountAdmin(admin.ModelAdmin):
    list_display = ('customer_id', 'account_number', 'account_type',
                    'balance', 'status')
    list_display_links = ('account_number',)
    search_fields = ('account_number', 'customer_id')
    list_filter = ('account_type', 'status')


admin.site.register(Account, AccountAdmin)
admin.site.register(Customer, CustomerAdmin)
