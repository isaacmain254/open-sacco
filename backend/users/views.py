from django.shortcuts import render
from rest_framework import viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer


class UserViewList(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
