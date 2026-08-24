# API Contract v1

## Auth

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me

## Usuarios

- GET /api/v1/users/couriers

## Enderecos

- GET /api/v1/addresses
- POST /api/v1/addresses
- PUT /api/v1/addresses/{id}
- DELETE /api/v1/addresses/{id}

## Restaurantes e cardapio

- GET /api/v1/restaurants
- GET /api/v1/restaurants/mine
- POST /api/v1/restaurants
- GET /api/v1/restaurants/{id}
- GET /api/v1/restaurants/{id}/menu

## Produtos (restaurante)

- GET /api/v1/products/restaurant/{restaurant_id}
- POST /api/v1/products
- PUT /api/v1/products/{id}
- DELETE /api/v1/products/{id}

## Carrinho (legado)

- POST /api/v1/cart/items
- DELETE /api/v1/cart/items/{item_id}

## Pedidos

- POST /api/v1/orders
- GET /api/v1/orders/me
- PATCH /api/v1/orders/{id}/status
- PATCH /api/v1/orders/{id}/assign-courier
- `POST /api/v1/orders` retorna `404` quando algum `product_id` informado nao existe.

## Entregador

- PATCH /api/v1/deliveries/{id}/status
- POST /api/v1/deliveries/{id}/location
- GET /api/v1/deliveries/me/active
- `POST /api/v1/deliveries/{id}/location` valida coordenadas:
  - `latitude` entre `-90` e `90`
  - `longitude` entre `-180` e `180`
