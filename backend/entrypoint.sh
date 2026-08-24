#!/bin/sh
set -e

ATTEMPTS=0
MAX_ATTEMPTS=${MAX_MIGRATION_ATTEMPTS:-15}

until alembic upgrade head; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo "Migration failed after ${ATTEMPTS} attempts."
    exit 1
  fi

  echo "Waiting for database... (${ATTEMPTS}/${MAX_ATTEMPTS})"
  sleep 2
done

if [ "$SEED_DEMO_DATA" = "true" ]; then
  python -m app.seed_demo
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
