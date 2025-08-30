#!/bin/bash
# Build script for Django deployment

echo "Running Django migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"
