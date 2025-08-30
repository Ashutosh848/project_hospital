#!/bin/bash
cd hospital_claims

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the server
echo "Starting server..."
gunicorn hospital_claims.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
  