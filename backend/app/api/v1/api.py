from fastapi import APIRouter

from app.api.v1.routes import auth, deliveries, orders, products, restaurants

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(restaurants.router, prefix="/restaurants", tags=["restaurants"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, tags=["orders"])
api_router.include_router(deliveries.router, tags=["deliveries"])
