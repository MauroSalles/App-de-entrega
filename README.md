# 🍔 App de Entrega - Projeto Integrador II

Aplicação de delivery inspirada em plataformas como iFood, com fluxo completo para **cliente**, **restaurante**, **entregador** e **admin**.

> Status atual: vitrine de restaurantes, carrinho local, checkout com endereço real, histórico de pedidos e acompanhamento básico de entregas.

## ✨ Destaques

- 🔐 Autenticação com JWT e perfis distintos
- 🏪 Cardápio digital com onboarding de restaurante
- 🛒 Carrinho persistido no navegador
- 📦 Pedido com endereço real salvo na conta
- 🛵 Atribuição de entregador, atualização de status e localização
- 🧪 Testes de API + smoke test do frontend no CI

## 🧱 Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | Next.js, TypeScript, Tailwind CSS, React Query, Zustand |
| Backend | FastAPI, SQLAlchemy, Alembic, JWT |
| Banco | PostgreSQL |
| Infra | Docker Compose, Nginx |

## 🗂️ Estrutura do projeto

```text
App-de-entrega/
├── backend/       # API FastAPI
├── frontend/      # App Next.js
├── infra/         # Nginx e scripts de deploy
├── docs/          # Requisitos, contrato da API e deploy
└── docker-compose.yml
```

## 🚀 Subir o projeto com Docker

```bash
docker compose up -d --build
```

### Endereços locais

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Nginx: http://localhost

### Observações importantes

- O backend aplica **migrations automaticamente** na inicialização do container.
- Para popular dados de demonstração, mantenha `SEED_DEMO_DATA=true` no `docker-compose.yml`.

## 👥 Contas demo

| Perfil | Email | Senha | Uso principal |
| --- | --- | --- | --- |
| Dono do restaurante | `owner@demo.com` | `123456` | Cadastro de restaurante e produtos |
| Cliente | `client@demo.com` | `123456` | Navegação, carrinho e pedidos |
| Entregador | `courier@demo.com` | `123456` | Painel de entregas |

## ✅ Funcionalidades já disponíveis

- Cadastro, login e sessão por token JWT
- Perfis: `cliente`, `dono_restaurante`, `entregador` e `admin`
- CRUD de endereços do cliente
- Listagem de restaurantes e cardápio
- Onboarding básico de restaurante
- CRUD de produtos
- Carrinho local persistido no navegador
- Criação de pedido com endereço real
- Histórico de pedidos por perfil
- Vínculo de entregador ao pedido
- Atualização de status e localização de entrega
- Seed automática para ambiente local

## 🔌 Rotas principais da API

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/addresses`
- `POST /api/v1/addresses`
- `PUT /api/v1/addresses/{id}`
- `DELETE /api/v1/addresses/{id}`
- `GET /api/v1/restaurants`
- `GET /api/v1/restaurants/mine`
- `POST /api/v1/restaurants`
- `GET /api/v1/restaurants/{id}/menu`
- `GET /api/v1/products/restaurant/{id}`
- `POST /api/v1/products`
- `PUT /api/v1/products/{id}`
- `DELETE /api/v1/products/{id}`
- `POST /api/v1/orders`
- `GET /api/v1/orders/me`
- `PATCH /api/v1/orders/{id}/status`
- `PATCH /api/v1/orders/{id}/assign-courier`
- `GET /api/v1/users/couriers`
- `PATCH /api/v1/deliveries/{id}/status`
- `POST /api/v1/deliveries/{id}/location`
- `GET /api/v1/deliveries/me/active`

## 🧪 Testes e validação

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

O workflow `.github/workflows/ci.yml` executa os testes da API e um smoke test básico do frontend.

## 📚 Documentação complementar

- `docs/requirements.md`
- `docs/api-contract.md`
- `docs/oracle-deploy.md`
- `backend/README.md`
- `frontend/README.md`

## 🎯 Próximos bons passos

- Refinar observabilidade e tratamento de erros
- Evoluir a experiência mobile e estados de carregamento
- Adicionar métricas operacionais e dashboards
- Expandir a gestão do pedido para múltiplos cenários de entrega
