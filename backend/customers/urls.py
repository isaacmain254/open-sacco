from django.urls import path
from rest_framework import routers

from .views import CustomerViewSet, AccountViewSet, TransactionViewSet, LoanViewSet

router = routers.DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'accounts', AccountViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'loans', LoanViewSet)

urlpatterns = router.urls
