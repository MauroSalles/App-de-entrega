from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.services.products import create_product, delete_product, list_restaurant_products, update_product

router = APIRouter()


@router.get("/restaurant/{restaurant_id}", response_model=list[ProductOut])
def get_restaurant_products(
    restaurant_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    return list_restaurant_products(db, restaurant_id, user)


@router.post("", response_model=ProductOut)
def create_product_endpoint(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    return create_product(db, payload, user)


@router.put("/{product_id}", response_model=ProductOut)
def update_product_endpoint(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    return update_product(db, product_id, payload, user)


@router.delete("/{product_id}")
def delete_product_endpoint(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    delete_product(db, product_id, user)
    return {"message": "Produto removido"}
