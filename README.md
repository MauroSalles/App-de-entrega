# 🍔 App de Entrega — Projeto Integrador II

Aplicação de delivery estilo iFood com **cardápio digital**, desenvolvida para o Projeto Integrador da faculdade.

> Este projeto é a continuação da evolução do grupo após o sistema de CRM da gelateria/açaiteria.

---

## 📌 Objetivo

Desenvolver uma plataforma de entregas com:

- Cadastro e autenticação de usuários
- Catálogo de restaurantes
- Cardápio digital por restaurante
- Carrinho de compras
- Criação e acompanhamento de pedidos
- Painel do restaurante para gestão de pedidos

---

## 🧱 Stack Tecnológica

### Frontend
- **Next.js** (React + TypeScript)
- TailwindCSS
- Axios / React Query

### Backend
- **Python + FastAPI**
- SQLAlchemy
- Alembic (migrations)
- JWT (autenticação)

### Banco de Dados
- **PostgreSQL**

### Infra / Deploy
- **Oracle Cloud**
- Docker + Docker Compose
- Nginx (reverse proxy)

---

## 🗂️ Estrutura Inicial do Repositório

```bash
App-de-entrega/
├── frontend/               # Next.js app
├── backend/                # FastAPI app
├── infra/                  # Docker, nginx e scripts de deploy
├── docs/                   # Diagramas, requisitos e documentação da API
└── README.md
```

---

## ✅ Escopo  (entrega inicial)

- [ ] Autenticação (cliente e restaurante)
- [ ] Listagem de restaurantes
- [ ] Cardápio digital por restaurante
- [ ] Carrinho de compras
- [ ] Criação de pedido
- [ ] Histórico de pedidos do cliente
- [ ] Atualização de status do pedido pelo restaurante

---

## 🧠 Regras de Negócio (resumo)

1. Cliente pode criar conta, fazer login e montar carrinho.
2. Restaurante pode cadastrar/editar/remover itens do cardápio.
3. Pedido possui status:
   - `recebido`
   - `em_preparo`
   - `saiu_entrega`
   - `entregue`
4. Cliente consegue visualizar o status do próprio pedido em tempo real.

---

## 🗃️ Modelo de Dados (entidades principais)

- `users`
- `restaurants`
- `categories`
- `products`
- `addresses`
- `orders`
- `order_items`
- `payments` (simulado no MVP)

---

## 🔌 Endpoints REST (versão inicial)

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Restaurantes e Cardápio
- `GET /api/v1/restaurants`
- `GET /api/v1/restaurants/{id}`
- `GET /api/v1/restaurants/{id}/menu`

### Carrinho e Pedidos
- `POST /api/v1/cart/items`
- `DELETE /api/v1/cart/items/{item_id}`
- `POST /api/v1/orders`
- `GET /api/v1/orders/me`
- `PATCH /api/v1/orders/{id}/status`

---

## 🚀 Como rodar localmente (planejado)

> Pré-requisitos: Docker, Docker Compose, Node.js, Python 3.11+

```bash
# 1) Clonar repositório
git clone https://github.com/MauroSalles/App-de-entrega.git
cd App-de-entrega

# 2) Subir serviços base (postgres, backend, frontend)
docker compose up -d --build

# 3) Acessar
# Frontend: http://localhost:3000
# Backend (docs): http://localhost:8000/docs
```

---

## 🧪 Qualidade e testes

- Testes unitários no backend com `pytest`
- Validações com Pydantic
- Padrões de código com `ruff` / `black`
- Convenções de commits (Conventional Commits)

---

## 👥 Equipe

Projeto desenvolvido por alunos do Projeto Integrador II.

- Time atual: *[adicionar nomes aqui]*

---

## 📅 Roadmap (4 Sprints)

### Sprint 1
- Setup do monorepo
- Ambiente Docker
- Modelagem inicial do banco
- Auth backend + telas de login/cadastro

### Sprint 2
- CRUD de restaurantes e cardápio
- Listagem no frontend
- Detalhes de produto

### Sprint 3
- Carrinho e criação de pedido
- Histórico de pedidos
- Atualização de status

### Sprint 4
- Deploy Oracle Cloud
- Ajustes finais, testes e documentação
- Preparação da apresentação final

---

## 📄 Licença

Definir (MIT, Apache 2.0 ou uso acadêmico interno).

---

## 🤝 Contribuição

1. Criar branch: `feature/nome-da-feature`
2. Commit: `feat: descrição`
3. Abrir Pull Request

---
