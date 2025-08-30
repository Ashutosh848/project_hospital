#!/bin/bash
cd hospital_claims
gunicorn hospital_claims.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
  