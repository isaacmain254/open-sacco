from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import User


FULL_ACCESS_ROLES = {User.ADMIN, User.MANAGER}
LOAN_ACCESS_ROLES = {User.ADMIN, User.MANAGER, User.OPERATION, User.LOAN}
ALL_BUSINESS_ROLES = {
    User.ADMIN,
    User.MANAGER,
    User.OPERATION,
    User.FINANCE,
    User.LOAN,
    User.ACCOUNTANT,
}


def has_role(user, roles):
    return bool(
        user
        and user.is_authenticated
        and (user.is_superuser or user.role in roles)
    )


class RolePermission(BasePermission):
    allowed_roles = set()

    def has_permission(self, request, view):
        return has_role(request.user, self.allowed_roles)


class HasUserManagementAccess(RolePermission):
    """Only administrators and managers can provision or administer staff."""

    allowed_roles = FULL_ACCESS_ROLES


class HasMemberAccess(RolePermission):
    # Loan officers' "customers" access maps to the members module.
    allowed_roles = ALL_BUSINESS_ROLES


class HasAccountAccess(RolePermission):
    allowed_roles = ALL_BUSINESS_ROLES


class HasTransactionAccess(RolePermission):
    allowed_roles = ALL_BUSINESS_ROLES


class HasLoanAccess(RolePermission):
    allowed_roles = LOAN_ACCESS_ROLES


class HasProductManagementAccess(BasePermission):
    """Everyone who can use accounts may read products; only AD/MA may change them."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return has_role(request.user, ALL_BUSINESS_ROLES)
        return has_role(request.user, FULL_ACCESS_ROLES)


class UserAccessPermission(BasePermission):
    """Only admins and managers manage users; users can still access their own profile."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if getattr(view, "action", None) in {"list", "create", "destroy"}:
            return has_role(request.user, FULL_ACCESS_ROLES)

        return True

    def has_object_permission(self, request, view, obj):
        return obj.pk == request.user.pk or has_role(request.user, FULL_ACCESS_ROLES)
