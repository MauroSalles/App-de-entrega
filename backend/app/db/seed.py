from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.address import Address
from app.models.enums import UserRole
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.models.user import User


def get_or_create_user(session, *, name: str, email: str, raw_password: str, role: UserRole) -> User:
    user = session.scalar(select(User).where(User.email == email))
    if user:
        return user

    user = User(name=name, email=email, password_hash=get_password_hash(raw_password), role=role)
    session.add(user)
    session.flush()
    return user


def run() -> None:
    session = SessionLocal()
    try:
        owner = get_or_create_user(
            session,
            name="Dono Demo",
            email="owner@demo.local",
            raw_password="demo123",
            role=UserRole.dono_restaurante,
        )
        client = get_or_create_user(
            session,
            name="Cliente Demo",
            email="cliente@demo.local",
            raw_password="demo123",
            role=UserRole.cliente,
        )
        get_or_create_user(
            session,
            name="Entregador Demo",
            email="entregador@demo.local",
            raw_password="demo123",
            role=UserRole.entregador,
        )

        restaurant = session.scalar(
            select(Restaurant).where(Restaurant.owner_user_id == owner.id, Restaurant.name == "Demo Burgers")
        )
        if not restaurant:
            restaurant = Restaurant(
                owner_user_id=owner.id,
                name="Demo Burgers",
                description="Hamburgueria para demonstracao",
                delivery_fee=6,
                avg_delivery_time_min=35,
                is_active=True,
            )
            session.add(restaurant)
            session.flush()

        if not session.scalar(select(Address).where(Address.user_id == client.id)):
            session.add(
                Address(
                    user_id=client.id,
                    street="Rua das Flores",
                    number="123",
                    district="Centro",
                    city="Sao Paulo",
                    state="SP",
                    zip_code="01000-000",
                    complement="Apto 12",
                    reference="Proximo a praca",
                )
            )

        existing_products = session.scalars(select(Product).where(Product.restaurant_id == restaurant.id)).all()
        if not existing_products:
            session.add_all(
                [
                    Product(
                        restaurant_id=restaurant.id,
                        name="Burger Classico",
                        description="Pao, carne e queijo",
                        price=24.9,
                        is_available=True,
                    ),
                    Product(
                        restaurant_id=restaurant.id,
                        name="Batata Crocante",
                        description="Porcao individual",
                        price=12.5,
                        is_available=True,
                    ),
                ]
            )

        session.commit()
    finally:
        session.close()


if __name__ == "__main__":
    run()
