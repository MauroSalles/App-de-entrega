# Deploy Oracle Cloud (VM Ubuntu)

## 1. Provisionamento

1. Criar VM Ubuntu 22.04.
2. Liberar portas 80 e 443 publicamente; manter 5432 apenas na rede interna.
3. Instalar Docker e Docker Compose plugin.
4. Definir variaveis de ambiente fora do repositorio (`SECRET_KEY`, `DATABASE_URL`, `POSTGRES_PASSWORD`).

## 2. Publicacao

1. Clonar repositorio na VM.
2. Exportar segredos em um arquivo `.env` da maquina ou no shell da sessao.
3. Executar:

```bash
docker compose up -d --build
```

O backend aplica migrations automaticamente. Em producao, deixe `SEED_DEMO_DATA=false`.

## 3. HTTPS

1. Apontar dominio para o IP da VM.
2. Instalar certbot.
3. Emitir certificado Let Encrypt.
4. Ajustar o Nginx para usar os certificados em `/etc/letsencrypt/live/<dominio>/`.
5. Renovar automaticamente com `certbot renew`.

## 4. Backup diario

Use o script `infra/backup.sh` em um cron da VM:

```bash
0 3 * * * BACKUP_DIR=/opt/backups POSTGRES_CONTAINER_NAME=delivery_postgres /caminho/do/repositorio/infra/backup.sh
```

## 5. Hardening minimo

- Nunca commitar `.env` com segredos reais.
- Trocar o `SECRET_KEY` padrao antes do deploy.
- Restringir a porta do Postgres ao host interno.
- Monitorar logs do container do backend e do nginx.
