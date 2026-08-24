#!/bin/sh
set -eu

BACKUP_DIR=${BACKUP_DIR:-/opt/backups}
DB_NAME=${POSTGRES_DB:-delivery_db}
DB_USER=${POSTGRES_USER:-postgres}
CONTAINER_NAME=${POSTGRES_CONTAINER_NAME:-delivery_postgres}

mkdir -p "$BACKUP_DIR"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/delivery_$(date +%F).sql"
