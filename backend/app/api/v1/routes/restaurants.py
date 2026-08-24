from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.schemas.product import ProductOut
from app.schemas.restaurant import RestaurantOut

router = APIRouter()


@router.get("", response_model=list[RestaurantOut])
def list_restaurants(db: Session = Depends(get_db)):
    return db.scalars(select(Restaurant).where(Restaurant.is_active.is_(True))).all()


@router.get("/{restaurant_id}", response_model=RestaurantOut)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == restaurant_id))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante nao encontrado")
    return restaurant


@router.get("/{restaurant_id}/menu", response_model=list[ProductOut])
def restaurant_menu(restaurant_id: int, db: Session = Depends(get_db)):
    return db.scalars(
        select(Product).where(Product.restaurant_id == restaurant_id, Product.is_available.is_(True))
    ).all()
