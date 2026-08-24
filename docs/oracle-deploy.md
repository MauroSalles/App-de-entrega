# Deploy Oracle Cloud (VM Ubuntu)

## 1. Provisionamento

1. Criar VM Ubuntu 22.04.
2. Liberar portas 80, 443, 3000, 8000 (temporariamente) e 5432 (somente interno se possivel).
3. Instalar Docker e Docker Compose plugin.

## 2. Publicacao

1. Clonar repositorio na VM.
2. Criar arquivo `backend/.env` com `SECRET_KEY` forte e `DATABASE_URL` apontando para o Postgres do compose.
3. Executar:

```bash
docker compose up -d --build
```

4. Seed opcional para demo:

```bash
docker compose exec backend python -m app.db.seed
```

> O container do backend executa `alembic upgrade head` automaticamente na subida.

## 3. HTTPS

1. Apontar dominio para o IP da VM.
2. Instalar certbot.
3. Emitir certificado Let Encrypt.
4. Ajustar `infra/nginx/default.conf` para ouvir em 443 e redirecionar 80 para HTTPS.

## 4. Backup diario

Adicionar cron na VM:

```bash
0 3 * * * docker exec delivery_postgres pg_dump -U postgres delivery_db > /opt/backups/delivery_$(date +\%F).sql
```
