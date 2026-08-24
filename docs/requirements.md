# Requisitos Funcionais e Nao Funcionais

## Funcionais (MVP)

1. Usuario cliente deve se cadastrar e autenticar.
2. Dono de restaurante deve cadastrar, editar e remover produtos.
3. Cliente deve listar restaurantes e consultar cardapio digital.
4. Cliente deve adicionar itens ao carrinho e criar pedido.
5. Restaurante deve atualizar status do pedido.
6. Restaurante deve vincular entregador ao pedido.
7. Entregador deve atualizar status simplificado da entrega.
8. Entregador deve enviar localizacao simplificada (latitude/longitude).

## Nao funcionais

1. API REST documentada via OpenAPI.
2. Banco PostgreSQL com migrations.
3. Backend em FastAPI e frontend em Next.js.
4. Deploy em Oracle Cloud via Docker Compose.
5. Backup diario com pg_dump no ambiente de producao.
