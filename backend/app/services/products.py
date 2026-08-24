from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate


def _get_owned_restaurant(db: Session, restaurant_id: int, user: User) -> Restaurant:
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == restaurant_id))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante nao encontrado")
    if user.role != UserRole.admin and restaurant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Restaurante nao pertence ao usuario")
    return restaurant


def list_restaurant_products(db: Session, restaurant_id: int, user: User) -> list[Product]:
    _get_owned_restaurant(db, restaurant_id, user)
    return db.scalars(select(Product).where(Product.restaurant_id == restaurant_id).order_by(Product.id.desc())).all()


def create_product(db: Session, payload: ProductCreate, user: User) -> Product:
    _get_owned_restaurant(db, payload.restaurant_id, user)
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, payload: ProductUpdate, user: User) -> Product:
    product = db.scalar(select(Product).where(Product.id == product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")

    _get_owned_restaurant(db, product.restaurant_id, user)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int, user: User) -> None:
    product = db.scalar(select(Product).where(Product.id == product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")

    _get_owned_restaurant(db, product.restaurant_id, user)
    db.delete(product)
    db.commit()
