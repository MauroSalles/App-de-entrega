#!/bin/sh
set -e

until alembic upgrade head; do
  echo "Waiting for database..."
  sleep 2
done

if [ "$SEED_DEMO_DATA" = "true" ]; then
  python -m app.seed_demo
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
