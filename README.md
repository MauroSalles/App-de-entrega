# App de Entrega - Projeto Integrador II

Aplicacao de delivery estilo iFood com cardapio digital, desenvolvida para o Projeto Integrador.

## Stack

- Frontend: Next.js + TypeScript + Tailwind + React Query + Zustand
- Backend: FastAPI + SQLAlchemy + Alembic + JWT
- Banco: PostgreSQL
- Infra: Docker Compose + Nginx

## Estrutura

```text
App-de-entrega/
   backend/       # API FastAPI
   frontend/      # App Next.js
   infra/         # Nginx e scripts de deploy
   docs/          # Requisitos e contrato de API
   docker-compose.yml
```

## Funcionalidades desta base

- Cadastro/login e autenticacao por token JWT
- Perfis: cliente, dono_restaurante, entregador, admin
- Enderecos do cliente com CRUD
- Listagem de restaurantes e cardapio
- Onboarding basico de restaurante
- CRUD de produtos (create/update/delete)
- Carrinho local persistido no navegador
- Criacao de pedido com selecao de endereco real
- Historico de pedidos por perfil
- Vinculo de entregador ao pedido
- Atualizacao de status e localizacao de entrega
- Seed/demo automatico para ambiente local

## Como rodar com Docker

```bash
docker compose up -d --build
```

O backend aplica migrations automaticamente ao iniciar. Para popular dados demo no ambiente local, deixe `SEED_DEMO_DATA=true` no compose.

## Contas demo

- Dono do restaurante: `owner@demo.com` / `123456`
- Cliente: `client@demo.com` / `123456`
- Entregador: `courier@demo.com` / `123456`

## Enderecos locais

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Docs Swagger: http://localhost:8000/docs
- Nginx: http://localhost

## Rotas principais

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me
- GET /api/v1/addresses
- POST /api/v1/addresses
- PUT /api/v1/addresses/{id}
- DELETE /api/v1/addresses/{id}
- GET /api/v1/restaurants
- GET /api/v1/restaurants/mine
- POST /api/v1/restaurants
- GET /api/v1/restaurants/{id}/menu
- GET /api/v1/products/restaurant/{id}
- POST /api/v1/products
- PUT /api/v1/products/{id}
- DELETE /api/v1/products/{id}
- POST /api/v1/orders
- GET /api/v1/orders/me
- PATCH /api/v1/orders/{id}/status
- PATCH /api/v1/orders/{id}/assign-courier
- GET /api/v1/users/couriers
- PATCH /api/v1/deliveries/{id}/status
- POST /api/v1/deliveries/{id}/location
- GET /api/v1/deliveries/me/active

## Testes e CI

### Backend

```bash
cd backend
python -m unittest discover -s tests -v
```

### Frontend

```bash
cd frontend
npm install
npm run build
npm run smoke
```

O workflow `.github/workflows/ci.yml` executa os testes de API e um smoke test basico do frontend.

## Documentacao complementar

- docs/requirements.md
- docs/api-contract.md
- docs/oracle-deploy.md
