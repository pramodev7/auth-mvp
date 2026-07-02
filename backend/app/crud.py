from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User
from app.schemas import UserCreate, UserUpdate
from app.security import hash_password


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def create_user(db: Session, user_in: UserCreate) -> User:
    user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
    data = user_in.model_dump(exclude_unset=True)
    if "email" in data:
        user.email = data["email"]
    if "password" in data:
        user.password_hash = hash_password(data["password"])
    if "role" in data:
        user.role = data["role"]
    db.commit()
    db.refresh(user)
    return user
