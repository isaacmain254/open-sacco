from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AccountViewSet, ProductViewSet, TransactionViewSet
app_name = "accounts"

# allow the urlconf to be automatically generated.
router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='accounts')
router.register(r'products', ProductViewSet, basename='products')
router.register(r'transactions', TransactionViewSet, basename='transactions')

urlpatterns = router.urls
