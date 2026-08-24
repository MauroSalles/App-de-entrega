from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.product import ProductOut
from app.schemas.restaurant import RestaurantCreate, RestaurantOut
from app.services.restaurants import (
    create_restaurant,
    get_restaurant_or_404,
    list_active_restaurants,
    list_owner_restaurants,
    list_restaurant_menu,
)

router = APIRouter()


@router.get("", response_model=list[RestaurantOut])
def list_restaurants(db: Session = Depends(get_db)):
    return list_active_restaurants(db)


@router.get("/mine", response_model=list[RestaurantOut])
def my_restaurants(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    return list_owner_restaurants(db, user)


@router.post("", response_model=RestaurantOut)
def create_restaurant_endpoint(
    payload: RestaurantCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    return create_restaurant(db, user, payload)


@router.get("/{restaurant_id}", response_model=RestaurantOut)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    return get_restaurant_or_404(db, restaurant_id)


@router.get("/{restaurant_id}/menu", response_model=list[ProductOut])
def restaurant_menu(restaurant_id: int, db: Session = Depends(get_db)):
    return list_restaurant_menu(db, restaurant_id)
