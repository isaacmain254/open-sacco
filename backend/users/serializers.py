from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.validators import UniqueValidator

# from .models import Profile
User = get_user_model()

# class UserProfileSerializer(serializers.ModelSerializer):
#     role_display = serializers.SerializerMethodField()

#     class Meta:
#         model = Profile
#         fields = ['role_display', 'profile_image']

#     def get_role_display(self, obj):
#         return obj.get_role_display()


# class UserSerializer(serializers.HyperlinkedModelSerializer):
#     profile = UserProfileSerializer()

#     class Meta:
#         model = User
#         fields = ['username', 'email', 'profile']

#     def create(self, validated_data):
#         profile = validated_data.pop('profile')
#         return User.objects.create(profile=Profile.objects.create(**profile), **validated_data)

#     def update(self, instance, validated_data):
#         instance.username = validated_data.get("username", instance.username)
#         instance.email = validated_data.get("email", instance.email)
#         instance.save()

#         if "profile" in validated_data:
#             instance.profile.profile_image = validated_data["profile"].get(
#                 "profile_image", instance.profile.profile_image)
#             instance.profile.role = validated_data["profile"].get(
#                 "role", instance.profile.role)
#             instance.profile.save()
#         return instance


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for registration of new users.
    """
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', "role", 'email', 'password', 'confirm_password')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
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


class PasswordResetTRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(
        min_length=8,
        validators=[validate_password],
        write_only=True
    )


# class ProfileSerializer(serializers.ModelSerializer):
#     user = UserSerializer()
#     role_display = serializers.SerializerMethodField()

#     class Meta:
#         model = Profile
#         fields = ('user', 'role_display', 'profile_image')

#     def get_role_display(self, obj):
#         return obj.get_role_display()
