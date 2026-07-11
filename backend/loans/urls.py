from rest_framework.routers import DefaultRouter

from .views import LoanApplicationViewSet, LoanTypeViewSet


app_name = "loans"

router = DefaultRouter()
router.register(r"loan-types", LoanTypeViewSet, basename="loan-type")
router.register(r"loans", LoanApplicationViewSet, basename="loan-application")

urlpatterns = router.urls