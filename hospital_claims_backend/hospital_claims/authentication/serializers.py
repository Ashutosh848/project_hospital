from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError('Invalid username or password.')
        else:
            raise serializers.ValidationError('Must include username and password.')

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    status = serializers.SerializerMethodField()
    createdAt = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'status', 'createdAt', 'password', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True},
            'date_joined': {'read_only': True}
        }
    
    def get_status(self, obj):
        return 'active' if obj.is_active else 'inactive'
    
    def get_createdAt(self, obj):
        return obj.date_joined.isoformat()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Map role from backend format to frontend format
        if data['role'] == 'dataentry':
            data['role'] = 'data_entry'
        return data
    
    def to_internal_value(self, data):
        # Map role from frontend format to backend format before validation
        if 'role' in data and data['role'] == 'data_entry':
            data = data.copy()
            data['role'] = 'dataentry'
        return super().to_internal_value(data)
    
    def validate_password(self, value):
        # Only validate password if it's provided and not empty
        if value and value.strip():
            validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Update all other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Only update password if a new one is provided
        if password and password.strip():
            instance.set_password(password)
        
        instance.save()
        return instance