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
   infra/         # Nginx e deploy
   docs/          # Requisitos e contrato de API
   docker-compose.yml
```

## Funcionalidades implementadas

- Cadastro, login e autenticacao JWT
- Perfis: cliente, dono_restaurante, entregador e admin
- Cadastro e edicao de restaurantes pelo dono
- Listagem publica de restaurantes e cardapio
- CRUD de produtos para o restaurante
- Carrinho persistido na API
- Cadastro de enderecos e escolha do endereco no checkout
- Criacao de pedido e historico por perfil
- Atualizacao de status do pedido
- Vinculo de entregador ao pedido
- Atualizacao de status e localizacao de entrega
- Seed opcional para demonstracao

## Como rodar com Docker

```bash
git clone https://github.com/MauroSalles/App-de-entrega.git
cd App-de-entrega
docker compose up -d --build
```

As migrations do backend sobem automaticamente no container.

## Seed opcional para demo

Com o ambiente no ar:

```bash
docker compose exec backend python -m app.db.seed
```

Usuarios demo criados:

- Cliente: `cliente@demo.local` / `demo123`
- Dono: `owner@demo.local` / `demo123`
- Entregador: `entregador@demo.local` / `demo123`

## Enderecos locais

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Docs Swagger: http://localhost:8000/docs
- Nginx: http://localhost

## Fluxos principais no frontend

- `/register`: cadastro de cliente, dono e entregador
- `/login`: autenticacao
- `/cart`: carrinho persistido + enderecos
- `/orders`: historico de pedidos
- `/owner`: onboarding do restaurante, cardapio, pedidos e vinculo de entregador
- `/courier`: painel do entregador

## Rotas principais

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me
- GET /api/v1/auth/couriers
- GET /api/v1/addresses
- POST /api/v1/addresses
- PUT /api/v1/addresses/{id}
- DELETE /api/v1/addresses/{id}
- GET /api/v1/restaurants
- GET /api/v1/restaurants/me
- POST /api/v1/restaurants
- PUT /api/v1/restaurants/{id}
- GET /api/v1/restaurants/{id}/menu
- GET /api/v1/products/restaurant/{restaurant_id}
- POST /api/v1/products
- PUT /api/v1/products/{id}
- DELETE /api/v1/products/{id}
- GET /api/v1/cart/items
- POST /api/v1/cart/items
- DELETE /api/v1/cart/items/{item_id}
- POST /api/v1/orders
- GET /api/v1/orders/me
- PATCH /api/v1/orders/{id}/status
- PATCH /api/v1/orders/{id}/assign-courier
- PATCH /api/v1/deliveries/{id}/status
- POST /api/v1/deliveries/{id}/location
- GET /api/v1/deliveries/me/active

## Documentacao complementar

- docs/requirements.md
- docs/api-contract.md
- docs/oracle-deploy.md

## Pendencias restantes para producao

1. Implementar testes automatizados de backend e frontend.
2. Configurar HTTPS real no Nginx da Oracle Cloud.
3. Automatizar backup diario no servidor de producao.
4. Endurecer observabilidade e monitoramento.
