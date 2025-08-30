#!/usr/bin/env python
"""
Start script for Railway deployment
"""
import os
import sys
import django

# Add the hospital_claims directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'hospital_claims'))

if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_claims.settings')
    django.setup()
    
    # Change to the correct directory
    os.chdir(os.path.join(os.path.dirname(__file__), 'hospital_claims'))
    
    from django.core.management import execute_from_command_line
    
    # Run migrations
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Collect static files
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
    
    # Start the server
    execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000'])
