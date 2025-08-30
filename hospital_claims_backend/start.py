#!/usr/bin/env python
"""
Start script for Railway deployment
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_claims.settings')
    django.setup()
    
    # Run migrations
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Collect static files
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
    
    # Start the server
    execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000'])
