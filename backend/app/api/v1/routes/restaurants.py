from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.product import ProductOut
from app.schemas.restaurant import RestaurantCreate, RestaurantOut, RestaurantUpdate

router = APIRouter()


@router.get("/me", response_model=list[RestaurantOut])
def list_my_restaurants(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    if user.role == UserRole.admin:
        return db.scalars(select(Restaurant)).all()
    return db.scalars(select(Restaurant).where(Restaurant.owner_user_id == user.id)).all()


@router.post("", response_model=RestaurantOut)
def create_restaurant(
    payload: RestaurantCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    owner_user_id = payload.owner_user_id if user.role == UserRole.admin and payload.owner_user_id else user.id
    restaurant = Restaurant(owner_user_id=owner_user_id, **payload.model_dump(exclude={"owner_user_id"}))
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("", response_model=list[RestaurantOut])
def list_restaurants(db: Session = Depends(get_db)):
    return db.scalars(select(Restaurant).where(Restaurant.is_active.is_(True))).all()


@router.get("/{restaurant_id}", response_model=RestaurantOut)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == restaurant_id))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante nao encontrado")
    return restaurant


@router.put("/{restaurant_id}", response_model=RestaurantOut)
def update_restaurant(
    restaurant_id: int,
    payload: RestaurantUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == restaurant_id))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante nao encontrado")
    if user.role != UserRole.admin and restaurant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissao")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("/{restaurant_id}/menu", response_model=list[ProductOut])
def restaurant_menu(restaurant_id: int, db: Session = Depends(get_db)):
    return db.scalars(
        select(Product).where(Product.restaurant_id == restaurant_id, Product.is_available.is_(True))
    ).all()
