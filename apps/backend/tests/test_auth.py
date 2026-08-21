import pytest

@pytest.mark.asyncio
async def test_register_success(client):
    payload = {
        "email": "candidate_test@swipex.io",
        "password": "Password1234!",
        "fullName": "Candidate Test",
        "role": "job_seeker"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "candidate_test@swipex.io"
    assert data["user"]["fullName"] == "Candidate Test"
    assert data["user"]["role"] == "job_seeker"

@pytest.mark.asyncio
async def test_register_duplicate_email_fails(client):
    payload = {
        "email": "dup_candidate@swipex.io",
        "password": "Password1234!",
        "fullName": "Candidate Dup",
        "role": "job_seeker"
    }
    res1 = await client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = await client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "Email already registered" in res2.json()["detail"]

@pytest.mark.asyncio
async def test_login_success(client):
    # 1. Register
    reg_payload = {
        "email": "login_test@swipex.io",
        "password": "Password1234!",
        "fullName": "Login Tester",
        "role": "job_seeker"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # 2. Login
    login_payload = {
        "email": "login_test@swipex.io",
        "password": "Password1234!"
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "login_test@swipex.io"

@pytest.mark.asyncio
async def test_login_invalid_password_fails(client):
    reg_payload = {
        "email": "login_fail@swipex.io",
        "password": "Password1234!",
        "fullName": "Login Fail",
        "role": "job_seeker"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "login_fail@swipex.io",
        "password": "WrongPassword999!"
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

@pytest.mark.asyncio
async def test_refresh_token_lifecycle(client):
    # 1. Register & get refresh token
    reg_payload = {
        "email": "refresh_test@swipex.io",
        "password": "Password1234!",
        "fullName": "Refresh Tester",
        "role": "job_seeker"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    refresh_token = reg_res.json()["refresh_token"]

    # 2. Call refresh
    refresh_res = await client.post("/api/v1/auth/refresh", json={"refreshToken": refresh_token})
    assert refresh_res.status_code == 200
    new_data = refresh_res.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data
    assert new_data["refresh_token"] != refresh_token

    # 3. Old refresh token should now be revoked (rotation)
    old_res = await client.post("/api/v1/auth/refresh", json={"refreshToken": refresh_token})
    assert old_res.status_code == 401

@pytest.mark.asyncio
async def test_me_authenticated_user(client):
    reg_payload = {
        "email": "me_test@swipex.io",
        "password": "Password1234!",
        "fullName": "Me Tester",
        "role": "job_seeker"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    access_token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["email"] == "me_test@swipex.io"
    assert user_data["fullName"] == "Me Tester"
    assert user_data["role"] == "job_seeker"

@pytest.mark.asyncio
async def test_forgot_and_reset_password_flow(client, db_session):
    # 1. Register user
    reg_payload = {
        "email": "forgot_test@swipex.io",
        "password": "OldPassword1234!",
        "fullName": "Forgot Tester",
        "role": "job_seeker"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # 2. Request forgot password
    forgot_res = await client.post("/api/v1/auth/forgot-password", json={"email": "forgot_test@swipex.io"})
    assert forgot_res.status_code == 200
    assert "instructions have been sent" in forgot_res.json()["message"]

    # 3. Query reset token directly from test DB to simulate email click
    from app.models.user import PasswordResetTokenModel, UserModel
    from sqlalchemy import select
    user_res = await db_session.execute(select(UserModel).where(UserModel.email == "forgot_test@swipex.io"))
    user = user_res.scalars().first()
    token_res = await db_session.execute(select(PasswordResetTokenModel).where(PasswordResetTokenModel.user_id == user.id))
    token_record = token_res.scalars().first()
    assert token_record is not None
    assert token_record.is_used is False
