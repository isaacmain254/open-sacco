from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import MemberViewSet
app_name = "members"

# allow the urlconf to be automatically generated.
router = DefaultRouter()
# router.register(r'members', MemberViewSet, basename='members')
# urlpatterns = router.urls

urlpatterns = [
    path('members/', MemberViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('members/<str:membership_number>/', MemberViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update' })),
]
