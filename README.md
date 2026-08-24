# 🍔 App de Entrega - Projeto Integrador II

> Uma aplicação de delivery estilo iFood com cardápio digital e sistema completo de gerenciamento de pedidos.

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | ⚛️ Next.js 13+ • TypeScript • 🎨 Tailwind CSS • ⚡ React Query • 🏪 Zustand |
| **Backend** | 🐍 FastAPI • 🗄️ SQLAlchemy • 📦 Alembic • 🔐 JWT |
| **Banco de Dados** | 🐘 PostgreSQL |
| **Infraestrutura** | 🐳 Docker Compose • 🌐 Nginx |

---

## 📁 Estrutura do Projeto

```
App-de-entrega/
│
├── 🔙 backend/          # API FastAPI
├── 🎨 frontend/         # Aplicação Next.js
├── 🌐 infra/            # Nginx e scripts de deploy
├── 📚 docs/             # Requisitos e contrato de API
└── docker-compose.yml   # Orquestração de containers
```

---

## ✨ Funcionalidades Implementadas

### 🔐 Autenticação & Autorização
- ✅ Cadastro e login de usuários
- ✅ Autenticação por token JWT
- ✅ 4 perfis de usuário distintos:
  - 👤 **Cliente** - Navega e faz pedidos
  - 🏪 **Dono do Restaurante** - Gerencia cardápio
  - 🚚 **Entregador** - Realiza entregas
  - ⚙️ **Admin** - Gerencia a plataforma

### 🍽️ Gerenciamento de Restaurantes
- ✅ Listagem de restaurantes
- ✅ Cardápio digital por restaurante
- ✅ CRUD de produtos (criar, atualizar, deletar)

### 🛒 Sistema de Pedidos
- ✅ Carrinho simples e funcional
- ✅ Criação de pedidos
- ✅ Histórico de pedidos por perfil
- ✅ Atualização de status em tempo real
- ✅ Vinculação automática de entregadores

### 📍 Gerenciamento de Entregas
- ✅ Rastreamento de status
- ✅ Atualização de localização em tempo real
- ✅ Histórico de entregas

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- 🐳 [Docker](https://www.docker.com/) e Docker Compose instalados
- 📝 Git para clonar o repositório

### Passo a passo

```bash
# 1️⃣ Clone o repositório
git clone https://github.com/MauroSalles/App-de-entrega.git
cd App-de-entrega

# 2️⃣ Inicie os containers
docker compose up -d --build

# 3️⃣ Aguarde o build completar (~2-3 minutos)
```

---

## 📍 Endereços Locais

| Serviço | URL | 📝 Descrição |
|---------|-----|-------------|
| 🎨 **Frontend** | [http://localhost:3000](http://localhost:3000) | Aplicação Next.js |
| 🔙 **Backend** | [http://localhost:8000](http://localhost:8000) | API FastAPI |
| 📖 **API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger Interactive |
| 🌐 **Nginx** | [http://localhost](http://localhost) | Reverse Proxy |

---

## 🔌 Principais Rotas da API

### 🔐 Autenticação
```
POST   /api/v1/auth/register          # Criar conta
POST   /api/v1/auth/login             # Fazer login
GET    /api/v1/auth/me                # Dados do usuário
```

### 🏪 Restaurantes
```
GET    /api/v1/restaurants            # Listar restaurantes
GET    /api/v1/restaurants/{id}/menu  # Menu de um restaurante
```

### 🍕 Produtos
```
POST   /api/v1/products               # Criar produto
PUT    /api/v1/products/{id}          # Atualizar produto
DELETE /api/v1/products/{id}          # Deletar produto
```

### 🛒 Carrinho
```
POST   /api/v1/cart/items             # Adicionar ao carrinho
```

### 📦 Pedidos
```
POST   /api/v1/orders                 # Criar pedido
GET    /api/v1/orders/me              # Meus pedidos
PATCH  /api/v1/orders/{id}/status     # Atualizar status
PATCH  /api/v1/orders/{id}/assign-courier  # Atribuir entregador
```

### 🚚 Entregas
```
PATCH  /api/v1/deliveries/{id}/status     # Atualizar status
POST   /api/v1/deliveries/{id}/location   # Atualizar localização
```

---

## 📚 Documentação Complementar

- 📋 [**requirements.md**](docs/requirements.md) - Requisitos funcionais e não-funcionais
- 📖 [**api-contract.md**](docs/api-contract.md) - Contrato completo da API
- 🌐 [**oracle-deploy.md**](docs/oracle-deploy.md) - Guia de deploy em Oracle Cloud

---

## 🎯 Próximos Passos Recomendados

### Para melhorias imediatas:
- [ ] 🧪 Implementar testes unitários dos serviços (auth, pedidos, entregas)
- [ ] 🌱 Criar seed inicial com dados de exemplo (restaurante, produtos, usuários)
- [ ] 🗺️ Refatorar fluxo de endereço no frontend (remover ID fixo do carrinho)
- [ ] 🔒 Finalizar HTTPS em produção
- [ ] 💾 Configurar backup diário no Oracle Cloud

---

## 💡 Dicas de Desenvolvimento

### Estrutura de Branches
```
main           # Production-ready
develop        # Desenvolvimento
feature/*      # Novas funcionalidades
bugfix/*       # Correções de bugs
```

### Variáveis de Ambiente
Crie arquivos `.env` nos diretórios backend e frontend com as configurações necessárias.

### Logs
```bash
# Ver logs em tempo real
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 📞 Suporte & Contribuições

Encontrou um bug? Tem uma sugestão? Abra uma [issue](https://github.com/MauroSalles/App-de-entrega/issues) ou faça um pull request! 🤝

---

<div align="center">

**Desenvolvido com ❤️ para o Projeto Integrador II**

⭐ Se este projeto foi útil, considere dar uma estrela!

</div>
