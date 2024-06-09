from django.shortcuts import render
from rest_framework import viewsets
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .serializers import UserSerializer, RegisterSerializer


class UserViewList(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            serializer = TokenObtainPairSerializer(data={
                'username': request.data['username'],
                'password': request.data['password']
            })
            serializer.is_valid(raise_exception=True)
            response.data['tokens'] = serializer.validated_data
        return response
