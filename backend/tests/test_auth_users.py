from fastapi.testclient import TestClient


def login(client: TestClient, email: str, password: str) -> str:
    response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_login_success_and_me_hides_password_hash(client: TestClient) -> None:
    token = login(client, "admin@example.com", "admin123")
    response = client.get("/auth/me", headers=auth_header(token))

    assert response.status_code == 200
    assert response.json()["email"] == "admin@example.com"
    assert response.json()["role"] == "admin"
    assert "password_hash" not in response.json()


def test_login_failure(client: TestClient) -> None:
    response = client.post("/auth/login", json={"email": "admin@example.com", "password": "wrong"})

    assert response.status_code == 401


def test_protected_route_requires_jwt(client: TestClient) -> None:
    response = client.get("/users")

    assert response.status_code == 401


def test_admin_can_crud_users(client: TestClient) -> None:
    token = login(client, "admin@example.com", "admin123")

    create_response = client.post(
        "/users",
        json={"email": "new@example.com", "password": "password123", "role": "member"},
        headers=auth_header(token),
    )
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]

    list_response = client.get("/users", headers=auth_header(token))
    assert list_response.status_code == 200
    assert any(user["email"] == "new@example.com" for user in list_response.json())

    update_response = client.patch(
        f"/users/{user_id}",
        json={"role": "admin"},
        headers=auth_header(token),
    )
    assert update_response.status_code == 200
    assert update_response.json()["role"] == "admin"

    delete_response = client.delete(f"/users/{user_id}", headers=auth_header(token))
    assert delete_response.status_code == 204


def test_member_can_read_but_not_write(client: TestClient) -> None:
    token = login(client, "member@example.com", "member123")

    list_response = client.get("/users", headers=auth_header(token))
    assert list_response.status_code == 200

    create_response = client.post(
        "/users",
        json={"email": "blocked@example.com", "password": "password123", "role": "member"},
        headers=auth_header(token),
    )
    assert create_response.status_code == 403
