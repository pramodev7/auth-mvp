from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.crud import create_user, get_user_by_email, update_user
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models import User
from app.schemas import LoginRequest, Token, UserCreate, UserRead, UserUpdate
from app.security import create_access_token, verify_password

router = APIRouter()


@router.post("/auth/login", response_model=Token)
def login(credentials: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = get_user_by_email(db, credentials.email)
    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(user.id), {"role": user.role.value})
    return Token(access_token=token)


@router.get("/auth/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.get("/users", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[User]:
    return list(db.scalars(select(User).order_by(User.id)))


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def add_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    try:
        return create_user(db, user_in)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")


@router.patch("/users/{user_id}", response_model=UserRead)
def edit_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    try:
        return update_user(db, user, user_in)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Response:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
