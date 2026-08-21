import pytest

@pytest.mark.asyncio
async def test_recruiter_pipeline_lifecycle(client, db_session):
    # 1. Register Recruiter
    rec_res = await client.post("/api/v1/auth/register", json={
        "email": "pipeline_recruiter@swipex.io",
        "password": "Password1234!",
        "fullName": "Recruiter Pipeline",
        "role": "recruiter"
    })
    rec_token = rec_res.json()["access_token"]
    rec_headers = {"Authorization": f"Bearer {rec_token}"}

    # 2. Register Candidate
    cand_res = await client.post("/api/v1/auth/register", json={
        "email": "pipeline_candidate@swipex.io",
        "password": "Password1234!",
        "fullName": "Jane Pipeline Candidate",
        "role": "job_seeker"
    })
    cand_token = cand_res.json()["access_token"]
    cand_headers = {"Authorization": f"Bearer {cand_token}"}

    # 3. Create a Company and Job in test DB
    from app.models.job import CompanyModel, JobModel
    company = CompanyModel(name="Starlight AI Labs", industry="AI / ML")
    db_session.add(company)
    await db_session.commit()
    await db_session.refresh(company)

    job = JobModel(
        company_id=company.id,
        title="Senior AI Engineer",
        description="Build LLM tools",
        is_active=True
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    # 4. Candidate applies for the job
    apply_res = await client.post("/api/v1/applications/", json={
        "jobId": str(job.id),
        "coverLetter": "Excited to apply for this AI position.",
        "atsScore": 94.0
    }, headers=cand_headers)
    assert apply_res.status_code == 200
    app_id = apply_res.json()["id"]

    # 5. Recruiter fetches pipeline -> finds Jane in 'new' stage
    pipeline_res = await client.get("/api/v1/applications/recruiter/pipeline", headers=rec_headers)
    assert pipeline_res.status_code == 200
    pipeline = pipeline_res.json()
    assert len(pipeline) >= 1
    found_app = next(a for a in pipeline if a["id"] == app_id)
    assert found_app["name"] == "Jane Pipeline Candidate"
    assert found_app["stage"] == "new"
    assert found_app["roleApplied"] == "Senior AI Engineer"

    # 6. Recruiter moves stage to 'interview'
    stage_res = await client.put(f"/api/v1/applications/{app_id}/status", json={"stage": "interview"}, headers=rec_headers)
    assert stage_res.status_code == 200
    assert stage_res.json()["status"] == "interview"

    # 7. Candidate checks notifications -> sees interview notification
    notif_res = await client.get("/api/v1/notifications", headers=cand_headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json()["notifications"]
    assert any("interview" in n["title"].lower() or "shortlisted" in n["title"].lower() for n in notifs)

@pytest.mark.asyncio
async def test_candidate_forbidden_from_pipeline(client):
    cand_res = await client.post("/api/v1/auth/register", json={
        "email": "unauth_cand@swipex.io",
        "password": "Password1234!",
        "fullName": "Unauth Cand",
        "role": "job_seeker"
    })
    token = cand_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.get("/api/v1/applications/recruiter/pipeline", headers=headers)
    assert res.status_code == 403
