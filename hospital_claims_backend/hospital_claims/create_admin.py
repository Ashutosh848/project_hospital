#!/usr/bin/env python
"""
Create a superuser for the hospital claims system
"""
import os
import sys
import django

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_claims.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_superuser():
    """Create a superuser"""
    try:
        # Check if superuser already exists
        if User.objects.filter(is_superuser=True).exists():
            print("Superuser already exists!")
            return
        
        # Create superuser
        user = User.objects.create_superuser(
            username='admin',
            email='admin@hospital.com',
            password='admin123456',
            role='manager'
        )
        
        print("✅ Superuser created successfully!")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Password: admin123456")
        print("Please change the password after first login!")
        
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")

if __name__ == "__main__":
    create_superuser()

