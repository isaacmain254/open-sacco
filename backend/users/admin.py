from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    ordering = ('email',)

    list_display = ('email', 'username', 'role', 'is_staff', 'is_active')
    search_fields = ('email', 'username')
    list_filter = ('role', 'is_staff', 'is_active')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('username', 'role', 'profile_image')}),
        ('Permissions', {'fields': ('is_staff', 'is_active',
         'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role', 'is_staff', 'is_superuser'),
        }),
    )
