from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.validators import UniqueValidator

from .models import Profile


class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['role_display', 'profile_image']

    def get_role_display(self, obj):
        return obj.get_role_display()


class UserSerializer(serializers.HyperlinkedModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ['username', 'email', 'profile']

    def create(self, validated_data):
        profile = validated_data.pop('profile')
        return User.objects.create(profile=Profile.objects.create(**profile), **validated_data)

    def update(self, instance, validated_data):
        instance.username = validated_data.get("username", instance.username)
        instance.email = validated_data.get("email", instance.email)
        instance.save()

        if "profile" in validated_data:
            instance.profile.profile_image = validated_data["profile"].get(
                "profile_image", instance.profile.profile_image)
            instance.profile.role = validated_data["profile"].get(
                "role", instance.profile.role)
            instance.profile.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for registration of new users.
    """
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )

        user.set_password(validated_data['password'])
        user.save()

        return user


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(
        min_length=8, validators=[validate_password])


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ('user', 'role_display', 'profile_image')

    def get_role_display(self, obj):
        return obj.get_role_display()
