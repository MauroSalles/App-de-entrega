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

## Pedidos

- POST /api/v1/orders
- GET /api/v1/orders/me
- PATCH /api/v1/orders/{id}/status
- PATCH /api/v1/orders/{id}/assign-courier

## Entregador

- PATCH /api/v1/deliveries/{id}/status
- POST /api/v1/deliveries/{id}/location
- GET /api/v1/deliveries/me/active
