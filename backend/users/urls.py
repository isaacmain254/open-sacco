from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, LogoutView, PasswordResetRequestView, PasswordResetView
# UserViewList RegisterView, , PasswordResetRequestView, PasswordResetConfirmView, UserProfileView

router = DefaultRouter()
# router.register(r'users', UserViewList, basename='users')

app_name = "users"

urlpatterns = [
    path('', include(router.urls)),
    path('login', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh-token', TokenRefreshView.as_view(), name='token_refresh'),
    path('register', RegisterView.as_view(), name='register'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('request-password-reset', PasswordResetRequestView.as_view(),
         name='request_password_reset'),
    path('password-reset',
         PasswordResetView.as_view(), name='password_reset'),
    # path('api/profile/', UserProfileView.as_view(), name='profile'),
]
