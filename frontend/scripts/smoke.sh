#!/bin/sh
set -eu

PORT=${PORT:-3000}
HOST=${HOST:-127.0.0.1}
LOG_FILE=${LOG_FILE:-/tmp/frontend-smoke.log}

PORT="$PORT" npm run start > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 60); do
  if curl -fsS "http://$HOST:$PORT" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

curl -fsS "http://$HOST:$PORT" | grep -q "Restaurantes"
curl -fsS "http://$HOST:$PORT/login" | grep -q "Entrar"
curl -fsS "http://$HOST:$PORT/register" | grep -q "Criar conta"
curl -fsS "http://$HOST:$PORT/cart" | grep -q "Carrinho"
