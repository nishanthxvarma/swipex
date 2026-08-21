import pytest

@pytest.mark.asyncio
async def test_profile_persistence_and_lifecycle(client):
    # 1. Register candidate
    reg_payload = {
        "email": "persist_candidate@swipex.io",
        "password": "Password1234!",
        "fullName": "Original Name",
        "role": "job_seeker"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get initial profile
    get_res = await client.get("/api/v1/users/profile", headers=headers)
    assert get_res.status_code == 200
    init_profile = get_res.json()
    assert init_profile["fullName"] == "Original Name"

    # 3. Update full profile
    update_payload = {
        "fullName": "Updated Alex Rivers",
        "headline": "Lead Full-Stack AI Engineer",
        "bio": "Building scalable modern cloud applications.",
        "location": "San Francisco, CA",
        "phone": "+1 555 019 2831",
        "skills": ["TypeScript", "Next.js", "Python", "FastAPI", "PostgreSQL"],
        "githubUrl": "https://github.com/alexrivers",
        "linkedinUrl": "https://linkedin.com/in/alexrivers"
    }
    put_res = await client.put("/api/v1/users/profile", json=update_payload, headers=headers)
    assert put_res.status_code == 200
    updated_profile = put_res.json()
    assert updated_profile["fullName"] == "Updated Alex Rivers"
    assert updated_profile["headline"] == "Lead Full-Stack AI Engineer"
    assert updated_profile["bio"] == "Building scalable modern cloud applications."
    assert updated_profile["location"] == "San Francisco, CA"
    assert "FastAPI" in updated_profile["skills"]
    assert updated_profile["githubUrl"] == "https://github.com/alexrivers"

    # 4. Partial update (Change ONLY headline)
    partial_payload = {
        "headline": "Principal Architect & AI Specialist"
    }
    patch_res = await client.put("/api/v1/users/profile", json=partial_payload, headers=headers)
    assert patch_res.status_code == 200
    patch_profile = patch_res.json()
    assert patch_profile["headline"] == "Principal Architect & AI Specialist"
    # Ensure ALL other fields remained intact and were NOT overwritten with null/empty
    assert patch_profile["fullName"] == "Updated Alex Rivers"
    assert patch_profile["bio"] == "Building scalable modern cloud applications."
    assert patch_profile["location"] == "San Francisco, CA"
    assert patch_profile["phone"] == "+1 555 019 2831"
    assert "FastAPI" in patch_profile["skills"]
    assert patch_profile["githubUrl"] == "https://github.com/alexrivers"

    # 5. Simulate Relogin Flow: Authenticate again and fetch profile
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "persist_candidate@swipex.io",
        "password": "Password1234!"
    })
    new_token = login_res.json()["access_token"]
    new_headers = {"Authorization": f"Bearer {new_token}"}

    relogin_profile_res = await client.get("/api/v1/users/profile", headers=new_headers)
    assert relogin_profile_res.status_code == 200
    persisted_profile = relogin_profile_res.json()
    assert persisted_profile["fullName"] == "Updated Alex Rivers"
    assert persisted_profile["headline"] == "Principal Architect & AI Specialist"
    assert persisted_profile["bio"] == "Building scalable modern cloud applications."
    assert persisted_profile["location"] == "San Francisco, CA"
    assert "FastAPI" in persisted_profile["skills"]

@pytest.mark.asyncio
async def test_multi_user_profile_isolation(client):
    # Register User A
    res_a = await client.post("/api/v1/auth/register", json={
        "email": "user_a@swipex.io",
        "password": "Password1234!",
        "fullName": "User Alpha",
        "role": "job_seeker"
    })
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register User B
    res_b = await client.post("/api/v1/auth/register", json={
        "email": "user_b@swipex.io",
        "password": "Password1234!",
        "fullName": "User Beta",
        "role": "job_seeker"
    })
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A updates profile
    await client.put("/api/v1/users/profile", json={
        "headline": "Alpha Top Engineer",
        "location": "New York, NY"
    }, headers=headers_a)

    # User B fetches their profile
    res_b_profile = await client.get("/api/v1/users/profile", headers=headers_b)
    data_b = res_b_profile.json()
    assert data_b["fullName"] == "User Beta"
    assert data_b["headline"] != "Alpha Top Engineer"
