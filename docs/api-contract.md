# API Contract v1

## Auth

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me

## Restaurantes e cardapio

- GET /api/v1/restaurants
- GET /api/v1/restaurants/{id}
- GET /api/v1/restaurants/{id}/menu

## Produtos (restaurante)

- POST /api/v1/products
- PUT /api/v1/products/{id}
- DELETE /api/v1/products/{id}

## Carrinho e pedidos

- POST /api/v1/cart/items
- DELETE /api/v1/cart/items/{item_id}
- POST /api/v1/orders
- GET /api/v1/orders/me
- PATCH /api/v1/orders/{id}/status

## Entregador

- PATCH /api/v1/orders/{id}/assign-courier
- PATCH /api/v1/deliveries/{id}/status
- POST /api/v1/deliveries/{id}/location
- GET /api/v1/deliveries/me/active
