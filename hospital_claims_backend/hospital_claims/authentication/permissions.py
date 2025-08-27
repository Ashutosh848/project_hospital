from rest_framework import permissions

class IsManager(permissions.BasePermission):
    """
    Custom permission to only allow managers to perform actions.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'manager'

class IsDataEntryOrManager(permissions.BasePermission):
    """
    Custom permission to allow both data entry users and managers.
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role in ['dataentry', 'manager'])