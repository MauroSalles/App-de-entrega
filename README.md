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

## Funcionalidades implementadas nesta base

- Cadastro/login e autenticacao por token JWT
- Perfis: cliente, dono_restaurante, entregador, admin
- Listagem de restaurantes e cardapio
- CRUD de produtos (create/update/delete)
- Carrinho simples (API)
- Criacao de pedido e historico por perfil
- Atualizacao de status do pedido
- Vinculo de entregador ao pedido
- Atualizacao de status e localizacao de entrega

## Como rodar com Docker

```bash
git clone https://github.com/MauroSalles/App-de-entrega.git
cd App-de-entrega
docker compose up -d --build
```

## Enderecos locais

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Docs Swagger: http://localhost:8000/docs
- Nginx: http://localhost

## Rotas principais

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me
- GET /api/v1/restaurants
- GET /api/v1/restaurants/{id}/menu
- POST /api/v1/products
- PUT /api/v1/products/{id}
- DELETE /api/v1/products/{id}
- POST /api/v1/cart/items
- POST /api/v1/orders
- GET /api/v1/orders/me
- PATCH /api/v1/orders/{id}/status
- PATCH /api/v1/orders/{id}/assign-courier
- PATCH /api/v1/deliveries/{id}/status
- POST /api/v1/deliveries/{id}/location

## Documentacao complementar

- docs/requirements.md
- docs/api-contract.md
- docs/oracle-deploy.md

## Proximos passos recomendados para a banca

1. Implementar testes unitarios de servicos (auth, pedido, entrega).
2. Criar seed inicial com restaurante, produtos, cliente e entregador.
3. Ajustar fluxo de endereco no frontend (evitar id fixo no carrinho).
4. Finalizar HTTPS e backup diario no deploy Oracle Cloud.

