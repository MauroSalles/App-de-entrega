# Backend FastAPI

## Rodando local

1. Copie .env.example para .env
2. Instale dependencias:

```bash
pip install -r requirements.txt
```

3. Rode migrations:

```bash
alembic upgrade head
```

4. Inicie API:

```bash
uvicorn app.main:app --reload
```

Swagger: http://localhost:8000/docs
