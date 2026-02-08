from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import MemberViewSet
app_name = "members"

# allow the urlconf to be automatically generated.
router = DefaultRouter()
router.register(r'members', MemberViewSet, basename='members')
urlpatterns = router.urls