import pytest

@pytest.mark.asyncio
async def test_admin_recruiter_verification_and_audit(client):
    # 1. Login as Predefined Admin
    from app.main import seed_admin_account
    await seed_admin_account()
    admin_res = await client.post("/api/v1/auth/login", json={
        "email": "sxadmin@gmail.com",
        "password": "Sxpassword1234"
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register Recruiter (initially unverified)
    rec_res = await client.post("/api/v1/auth/register", json={
        "email": "unverified_rec@swipex.io",
        "password": "Password1234!",
        "fullName": "Unverified Recruiter",
        "role": "recruiter"
    })
    rec_id = rec_res.json()["user"]["id"]

    # 3. Admin lists recruiters -> finds unverified recruiter
    list_res = await client.get("/api/v1/admin/recruiters", headers=admin_headers)
    assert list_res.status_code == 200
    recruiters = list_res.json()
    assert len(recruiters) >= 1
    target = next(r for r in recruiters if r["id"] == rec_id)
    assert target["isVerified"] is False
    assert target["status"] == "PENDING"

    # 4. Admin verifies recruiter -> updates DB & creates audit log
    verify_res = await client.put(f"/api/v1/admin/recruiters/{rec_id}/verify", headers=admin_headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["isVerified"] is True
    assert verify_res.json()["status"] == "VERIFIED"

    # 5. Admin checks audit log stream -> finds RECRUITER_VERIFIED event
    activity_res = await client.get("/api/v1/admin/activity", headers=admin_headers)
    assert activity_res.status_code == 200
    logs = activity_res.json()
    assert any("RECRUITER_VERIFIED" in l["action"] for l in logs)

    # 6. Admin suspends recruiter
    suspend_res = await client.put(f"/api/v1/admin/recruiters/{rec_id}/status", json={"status": "SUSPENDED"}, headers=admin_headers)
    assert suspend_res.status_code == 200
    assert suspend_res.json()["isActive"] is False
    assert suspend_res.json()["status"] == "SUSPENDED"

@pytest.mark.asyncio
async def test_non_admin_forbidden_from_admin_endpoints(client):
    # Candidate attempt
    cand_res = await client.post("/api/v1/auth/register", json={
        "email": "intruder_cand@swipex.io",
        "password": "Password1234!",
        "fullName": "Intruder Candidate",
        "role": "job_seeker"
    })
    cand_token = cand_res.json()["access_token"]
    cand_headers = {"Authorization": f"Bearer {cand_token}"}

    res1 = await client.get("/api/v1/admin/recruiters", headers=cand_headers)
    assert res1.status_code == 403

    res2 = await client.get("/api/v1/admin/activity", headers=cand_headers)
    assert res2.status_code == 403

    # Recruiter attempt
    rec_res = await client.post("/api/v1/auth/register", json={
        "email": "intruder_rec@swipex.io",
        "password": "Password1234!",
        "fullName": "Intruder Recruiter",
        "role": "recruiter"
    })
    rec_token = rec_res.json()["access_token"]
    rec_headers = {"Authorization": f"Bearer {rec_token}"}

    res3 = await client.get("/api/v1/admin/recruiters", headers=rec_headers)
    assert res3.status_code == 403
