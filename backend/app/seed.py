from sqlalchemy.orm import Session

from app.config import get_settings
from app.crud import create_user, get_user_by_email
from app.models import UserRole
from app.schemas import UserCreate


def seed_admin(db: Session) -> None:
    settings = get_settings()
    if get_user_by_email(db, settings.admin_email) is not None:
        return
    create_user(
        db,
        UserCreate(
            email=settings.admin_email,
            password=settings.admin_password,
            role=UserRole.admin,
        ),
    )
