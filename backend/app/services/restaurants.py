from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.restaurant import RestaurantCreate


def list_active_restaurants(db: Session) -> list[Restaurant]:
    return db.scalars(select(Restaurant).where(Restaurant.is_active.is_(True))).all()


def get_restaurant_or_404(db: Session, restaurant_id: int) -> Restaurant:
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == restaurant_id))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante nao encontrado")
    return restaurant


def list_restaurant_menu(db: Session, restaurant_id: int) -> list[Product]:
    return db.scalars(
        select(Product).where(Product.restaurant_id == restaurant_id, Product.is_available.is_(True))
    ).all()


def list_owner_restaurants(db: Session, user: User) -> list[Restaurant]:
    if user.role == UserRole.admin:
        return db.scalars(select(Restaurant)).all()
    return db.scalars(select(Restaurant).where(Restaurant.owner_user_id == user.id)).all()


def create_restaurant(db: Session, user: User, payload: RestaurantCreate) -> Restaurant:
    owner_user_id = user.id
    restaurant = Restaurant(owner_user_id=owner_user_id, **payload.model_dump())
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant
