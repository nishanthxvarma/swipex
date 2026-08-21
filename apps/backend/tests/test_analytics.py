import pytest

@pytest.mark.asyncio
async def test_candidate_analytics_zero_fake_data(client, db_session):
    # 1. Register brand new candidate
    cand_res = await client.post("/api/v1/auth/register", json={
        "email": "zero_analytics@swipex.io",
        "password": "Password1234!",
        "fullName": "Zero Analytics User",
        "role": "job_seeker"
    })
    token = cand_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Query candidate analytics -> MUST NOT have fake fallbacks (42, 28, 14, 12, etc.)
    res = await client.get("/api/v1/analytics/candidate", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["totalJobsViewed"] == 0
    assert data["jobsLiked"] == 0
    assert data["jobsRejected"] == 0
    assert data["jobsSaved"] == 0
    assert data["applicationsSubmitted"] == 0
    assert data["interviewsCount"] == 0
    assert data["offersCount"] == 0
    assert data["applicationSuccessRatePct"] == 0.0

    # 3. Create job and candidate applies
    from app.models.job import CompanyModel, JobModel
    company = CompanyModel(name="Zero Fake Labs", industry="Analytics")
    db_session.add(company)
    await db_session.commit()
    await db_session.refresh(company)

    job = JobModel(company_id=company.id, title="Data Engineer", is_active=True)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    # Candidate swipes right
    await client.post(f"/api/v1/jobs/{job.id}/swipe?direction=right", headers=headers)

    # Candidate applies
    await client.post("/api/v1/applications/", json={
        "jobId": str(job.id),
        "coverLetter": "Genuine application",
        "atsScore": 92.5
    }, headers=headers)

    # 4. Query candidate analytics -> MUST now reflect genuine metrics
    res2 = await client.get("/api/v1/analytics/candidate", headers=headers)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["totalJobsViewed"] == 1
    assert data2["jobsLiked"] == 1
    assert data2["applicationsSubmitted"] == 1

@pytest.mark.asyncio
async def test_recruiter_analytics_zero_fake_data(client, db_session):
    rec_res = await client.post("/api/v1/auth/register", json={
        "email": "rec_analytics@swipex.io",
        "password": "Password1234!",
        "fullName": "Recruiter Analytics User",
        "role": "recruiter"
    })
    token = rec_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.get("/api/v1/analytics/recruiter", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data["activeJobsCount"], int)
    assert isinstance(data["applicationsReceivedCount"], int)
    assert isinstance(data["avgApplicantMatchScore"], (int, float))
    assert len(data["pipelineDistribution"]) == 7
