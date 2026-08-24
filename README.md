<div align="center">

# 🛵 App de Entrega

**Projeto Integrador II**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose/)

> Aplicação de delivery estilo iFood com cardápio digital, desenvolvida para o Projeto Integrador.

</div>

---

## 🚀 Stack

| Camada | Tecnologias |
|--------|------------|
| 🖥️ **Frontend** | Next.js · TypeScript · Tailwind CSS · React Query · Zustand |
| ⚙️ **Backend** | FastAPI · SQLAlchemy · Alembic · JWT |
| 🗄️ **Banco** | PostgreSQL |
| 🐳 **Infra** | Docker Compose · Nginx |

---

## 📁 Estrutura

```text
App-de-entrega/
├── backend/       # API FastAPI
├── frontend/      # App Next.js
├── infra/         # Nginx e deploy
├── docs/          # Requisitos e contrato de API
└── docker-compose.yml
```

---

## ✅ Funcionalidades implementadas

- 🔐 Cadastro, login e autenticação JWT
- 👤 Perfis: `cliente`, `dono_restaurante`, `entregador` e `admin`
- 🏪 Cadastro e edição de restaurantes pelo dono
- 📋 Listagem pública de restaurantes e cardápio
- 🍔 CRUD de produtos para o restaurante
- 🛒 Carrinho persistido na API
- 📍 Cadastro de endereços e escolha do endereço no checkout
- 📦 Criação de pedido e histórico por perfil
- 🔄 Atualização de status do pedido
- 🚴 Vínculo de entregador ao pedido
- 📡 Atualização de status e localização de entrega
- 🌱 Seed opcional para demonstração

---

## 🐳 Como rodar com Docker

```bash
git clone https://github.com/MauroSalles/App-de-entrega.git
cd App-de-entrega
docker compose up -d --build
```

> As migrations do backend sobem automaticamente no container. ✨

---

## 🌱 Seed opcional para demo

Com o ambiente no ar:

```bash
docker compose exec backend python -m app.db.seed
```

Usuários demo criados:

| Perfil | E-mail | Senha |
|--------|--------|-------|
| 👤 Cliente | `cliente@demo.local` | `demo123` |
| 🏪 Dono | `owner@demo.local` | `demo123` |
| 🚴 Entregador | `entregador@demo.local` | `demo123` |

---

## 🌐 Endereços locais

| Serviço | URL |
|---------|-----|
| 🖥️ Frontend | http://localhost:3000 |
| ⚙️ Backend | http://localhost:8000 |
| 📖 Swagger Docs | http://localhost:8000/docs |
| 🌐 Nginx | http://localhost |

---

## 🗺️ Fluxos principais no frontend

| Rota | Descrição |
|------|-----------|
| `/register` | Cadastro de cliente, dono e entregador |
| `/login` | Autenticação |
| `/cart` | Carrinho persistido + endereços |
| `/orders` | Histórico de pedidos |
| `/owner` | Onboarding do restaurante, cardápio, pedidos e vínculo de entregador |
| `/courier` | Painel do entregador |

---

## 📡 Rotas principais da API

<details>
<summary><strong>🔐 Auth</strong></summary>

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me
GET    /api/v1/auth/couriers
```

</details>

<details>
<summary><strong>📍 Endereços</strong></summary>

```
GET    /api/v1/addresses
POST   /api/v1/addresses
PUT    /api/v1/addresses/{id}
DELETE /api/v1/addresses/{id}
```

</details>

<details>
<summary><strong>🏪 Restaurantes</strong></summary>

```
GET    /api/v1/restaurants
GET    /api/v1/restaurants/me
POST   /api/v1/restaurants
PUT    /api/v1/restaurants/{id}
GET    /api/v1/restaurants/{id}/menu
```

</details>

<details>
<summary><strong>🍔 Produtos</strong></summary>

```
GET    /api/v1/products/restaurant/{restaurant_id}
POST   /api/v1/products
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}
```

</details>

<details>
<summary><strong>🛒 Carrinho</strong></summary>

```
GET    /api/v1/cart/items
POST   /api/v1/cart/items
DELETE /api/v1/cart/items/{item_id}
```

</details>

<details>
<summary><strong>📦 Pedidos & Entregas</strong></summary>

```
POST   /api/v1/orders
GET    /api/v1/orders/me
PATCH  /api/v1/orders/{id}/status
PATCH  /api/v1/orders/{id}/assign-courier
PATCH  /api/v1/deliveries/{id}/status
POST   /api/v1/deliveries/{id}/location
GET    /api/v1/deliveries/me/active
```

</details>

---

## 📚 Documentação complementar

- 📄 [`docs/requirements.md`](docs/requirements.md)
- 📄 [`docs/api-contract.md`](docs/api-contract.md)
- 📄 [`docs/oracle-deploy.md`](docs/oracle-deploy.md)

---

## 🔧 Pendências restantes para produção

- [ ] 🧪 Implementar testes automatizados de backend e frontend
- [ ] 🔒 Configurar HTTPS real no Nginx da Oracle Cloud
- [ ] 💾 Automatizar backup diário no servidor de produção
- [ ] 📊 Endurecer observabilidade e monitoramento

---

<div align="center">

Feito com ❤️ para o Projeto Integrador II

</div>
