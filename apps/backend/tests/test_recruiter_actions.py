import pytest

@pytest.mark.asyncio
async def test_recruiter_candidate_action_persistence(client):
    # 1. Register a Recruiter
    rec_res = await client.post("/api/v1/auth/register", json={
        "email": "recruiter_action@swipex.io",
        "password": "Password1234!",
        "fullName": "Recruiter Action",
        "role": "recruiter"
    })
    rec_token = rec_res.json()["access_token"]
    rec_headers = {"Authorization": f"Bearer {rec_token}"}

    # 2. Register a Candidate
    cand_res = await client.post("/api/v1/auth/register", json={
        "email": "candidate_target@swipex.io",
        "password": "Password1234!",
        "fullName": "Candidate Target",
        "role": "job_seeker"
    })
    cand_id = cand_res.json()["user"]["id"]

    # 3. Recruiter shortlists candidate
    action_payload = {
        "candidateId": cand_id,
        "action": "shortlist",
        "notes": "Strong background in Next.js and Python"
    }
    action_res = await client.post("/api/v1/users/candidates/action", json=action_payload, headers=rec_headers)
    assert action_res.status_code == 200
    action_data = action_res.json()
    assert action_data["success"] is True
    assert action_data["action"] == "shortlist"
    assert action_data["candidateId"] == cand_id

    # 4. Recruiter updates decision to "interest" (idempotent update without unique constraint error)
    update_res = await client.post("/api/v1/users/candidates/action", json={
        "candidateId": cand_id,
        "action": "interest"
    }, headers=rec_headers)
    assert update_res.status_code == 200
    assert update_res.json()["action"] == "interest"

@pytest.mark.asyncio
async def test_candidate_forbidden_from_candidate_actions(client):
    # Candidate tries to call candidate action endpoint
    cand_res = await client.post("/api/v1/auth/register", json={
        "email": "seeker_attempt@swipex.io",
        "password": "Password1234!",
        "fullName": "Seeker Attempt",
        "role": "job_seeker"
    })
    token = cand_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    action_res = await client.post("/api/v1/users/candidates/action", json={
        "candidateId": str(cand_res.json()["user"]["id"]),
        "action": "shortlist"
    }, headers=headers)
    assert action_res.status_code == 403
