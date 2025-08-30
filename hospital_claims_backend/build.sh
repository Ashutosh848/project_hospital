#!/bin/bash
# Build script for Django deployment

echo "Changing to hospital_claims directory..."
cd hospital_claims

echo "Running Django migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"
