import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import UserRole
from app.schemas import UserCreate
from app.crud import create_user


@pytest.fixture()
def db_session() -> Session:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    create_user(db, UserCreate(email="admin@example.com", password="admin123", role=UserRole.admin))
    create_user(db, UserCreate(email="member@example.com", password="member123", role=UserRole.member))
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client(db_session: Session) -> TestClient:
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
