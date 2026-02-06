# from django.shortcuts import render
# from django.contrib.auth.models import User
from .models import User  # or get_user_model()
from .serializers import PasswordResetTRequestSerializer
from rest_framework import generics, status
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth import get_user_model
from django.contrib.auth import logout
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
# from django.contrib.auth import get_user_model
from rest_framework import viewsets, generics, status, permissions, authentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
# from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .serializers import RegisterSerializer, PasswordResetTRequestSerializer, PasswordResetSerializer

# from .serializers import PasswordResetConfirmSerializer, UserSerializer, RegisterSerializer, PasswordResetSerializer, ProfileSerializer
# from .models import Profile

User = get_user_model()

# class UserViewList(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer


# class UserProfileView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
#     parser_classes = (MultiPartParser, FormParser, JSONParser)

#     def get(self, request):
#         user = request.user
#         serializer = UserSerializer(user)
#         return Response(serializer.data)

#     def patch(self, request):
#         user = request.user
#         serializer = UserSerializer(user, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(generics.CreateAPIView):
    """
    Register user with email and password
    Fields:
        - username
        - email
        - password
        - password_confirm
        - role (optional)
    """
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            # serializer = TokenObtainPairSerializer(data={
            #     'email': request.data['email'],
            #     'password': request.data['password']
            # })
            # serializer.is_valid(raise_exception=True)
            # response.data['tokens'] = serializer.validated_data
            return response

# Get request


class LogoutView(APIView):
    """
    Logout user
    """

    def get(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetRequestView(generics.GenericAPIView):
    """
    Request password reset for a user. Send an email with a reset link containing a token and uid. \n
    Fields:
        - email
    """
    permission_classes = (AllowAny,)
    serializer_class = PasswordResetTRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get('email')

        user = User.objects.filter(email=email).first()
        if not user:
            return Response(
                {"detail": "No user found with this email"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate token and uid
        token = default_token_generator.make_token(user)
        # uid = urlsafe_base64_encode(force_bytes(user.pk))
        uid = user.pk
        print("uid", user.pk)

        reset_url = f"http://localhost:3000/reset-password/?user={uid}&token={token}"
        print("reset_url", reset_url)

        send_mail(
            subject="Password reset",
            message=f"Click to reset your password: {reset_url}",
            from_email="from@example.com",
            recipient_list=[email],
        )

        return Response(
            {"message": "Password reset email sent successfully"},
            status=status.HTTP_200_OK
        )


# # TODO: Add SERIALIZER CLASS
class PasswordResetView(generics.GenericAPIView):
    """
    Password reset view to handle password reset requests. Validate the token and uid, and set the new password. \n
    Fields: 
    - uid
    - token
    - password
    """
    serializer_class = PasswordResetSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # uid = force_str(urlsafe_base64_decode(
        #     serializer.validated_data["uid"]))
        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        password = serializer.validated_data["password"]

        user = User.objects.filter(pk=uid).first()

        if not user or not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(password)
        user.save()

        return Response(
            {"detail": "Password reset successful"},
            status=status.HTTP_204_NO_CONTENT
        )


# class ProfileView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
#     parser_classes = (MultiPartParser, FormParser)

#     def get(self, request, *args, **kwargs):
#         profile = Profile.objects.filter(user=request.user)
#         serializer = ProfileSerializer(profile, many=True)
#         return Response(serializer.data)

#     # TODO: This should be a PUT request
#     def put(self, request, *args, **kwargs):
#         profile = Profile.objects.get(user=request.user)
#         serializer = ProfileSerializer(profile, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
