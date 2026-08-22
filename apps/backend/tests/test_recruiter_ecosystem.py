import pytest
import uuid

@pytest.mark.asyncio
async def test_full_recruiter_to_candidate_to_application_to_pipeline_lifecycle(client):
    # 1. Register Recruiter
    recruiter_email = f"recruiter_{uuid.uuid4().hex[:8]}@swipex.io"
    rec_reg = await client.post("/api/v1/auth/register", json={
        "email": recruiter_email,
        "password": "Password1234!",
        "fullName": "Sarah Recruiter",
        "role": "recruiter"
    })
    assert rec_reg.status_code == 201
    rec_token = rec_reg.json()["access_token"]
    rec_headers = {"Authorization": f"Bearer {rec_token}"}

    # 2. Register Candidate
    cand_email = f"candidate_{uuid.uuid4().hex[:8]}@swipex.io"
    cand_reg = await client.post("/api/v1/auth/register", json={
        "email": cand_email,
        "password": "Password1234!",
        "fullName": "Nishanth Candidate",
        "role": "job_seeker"
    })
    assert cand_reg.status_code == 201
    cand_token = cand_reg.json()["access_token"]
    cand_headers = {"Authorization": f"Bearer {cand_token}"}

    # 3. Verify Candidate CANNOT access recruiter endpoints (403)
    cand_forbidden_jobs = await client.get("/api/v1/jobs/recruiter/mine", headers=cand_headers)
    assert cand_forbidden_jobs.status_code == 403

    cand_forbidden_pipeline = await client.get("/api/v1/applications/recruiter/pipeline", headers=cand_headers)
    assert cand_forbidden_pipeline.status_code == 403

    cand_forbidden_analytics = await client.get("/api/v1/analytics/recruiter", headers=cand_headers)
    assert cand_forbidden_analytics.status_code == 403

    # 4. Recruiter creates Company
    comp_res = await client.post("/api/v1/companies/", json={
        "name": f"Acme Tech {uuid.uuid4().hex[:4]}",
        "industry": "Artificial Intelligence",
        "size": "100-500",
        "website": "https://acmetech.io",
        "description": "Building high scale distributed systems.",
        "headquarters": "San Francisco, CA"
    }, headers=rec_headers)
    assert comp_res.status_code == 200
    comp_id = comp_res.json()["id"]

    # 5. Recruiter creates & publishes Job
    job_res = await client.post("/api/v1/jobs/", json={
        "title": "Staff Frontend Architect",
        "companyId": comp_id,
        "location": "San Francisco, CA",
        "salaryMin": 180000,
        "salaryMax": 240000,
        "skillsRequired": ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        "description": "Lead modern web architecture."
    }, headers=rec_headers)
    assert job_res.status_code == 200
    job_data = job_res.json()
    job_id = job_data["id"]
    assert job_data["title"] == "Staff Frontend Architect"
    assert job_data["isActive"] is True

    # 6. Recruiter lists their jobs
    rec_jobs = await client.get("/api/v1/jobs/recruiter/mine", headers=rec_headers)
    assert rec_jobs.status_code == 200
    rec_jobs_data = rec_jobs.json()
    assert any(j["id"] == job_id for j in rec_jobs_data)

    # 7. Candidate discovers the job in public listing & feed
    cand_jobs = await client.get("/api/v1/jobs/", headers=cand_headers)
    assert cand_jobs.status_code == 200
    assert any(j["id"] == job_id for j in cand_jobs.json())

    # 8. Candidate applies to the job
    apply_res = await client.post("/api/v1/applications/", json={
        "jobId": job_id,
        "coverLetter": "Excited about this role!",
        "atsScore": 96.0
    }, headers=cand_headers)
    assert apply_res.status_code == 200
    app_id = apply_res.json()["id"]

    # 9. Duplicate application is prevented
    dup_apply = await client.post("/api/v1/applications/", json={
        "jobId": job_id
    }, headers=cand_headers)
    assert dup_apply.status_code == 400

    # 10. Recruiter retrieves pipeline & verifies applicant presence
    pipeline_res = await client.get("/api/v1/applications/recruiter/pipeline", headers=rec_headers)
    assert pipeline_res.status_code == 200
    pipeline = pipeline_res.json()
    matching_apps = [p for p in pipeline if p["id"] == app_id or p["jobId"] == job_id]
    assert len(matching_apps) > 0
    app_in_pipe = matching_apps[0]
    assert app_in_pipe["stage"] == "new"

    # 11. Recruiter updates candidate stage: new -> interview
    status_res = await client.put(f"/api/v1/applications/{app_id}/status", json={
        "status": "interview"
    }, headers=rec_headers)
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "interview"

    # 12. Candidate retrieves their applications & sees INTERVIEW status
    cand_apps_res = await client.get("/api/v1/applications/", headers=cand_headers)
    assert cand_apps_res.status_code == 200
    cand_app = next(a for a in cand_apps_res.json() if a["id"] == app_id)
    assert cand_app["status"] == "interview"

    # 13. Candidate checks notifications & sees interview notification
    notifs_res = await client.get("/api/v1/notifications", headers=cand_headers)
    assert notifs_res.status_code == 200
    notifs = notifs_res.json()["notifications"] if "notifications" in notifs_res.json() else notifs_res.json()
    assert len(notifs) >= 2 # Application Submitted + Interview Scheduled

    # 14. Recruiter views analytics & verifies non-zero counts
    analytics_res = await client.get("/api/v1/analytics/recruiter", headers=rec_headers)
    assert analytics_res.status_code == 200
    rec_analytics = analytics_res.json()
    assert rec_analytics["activeJobsCount"] >= 1
    assert rec_analytics["applicationsReceivedCount"] >= 1
    assert rec_analytics["interviewsCount"] >= 1

    # 15. Recruiter pauses job -> Candidate no longer sees it in list
    pause_res = await client.put(f"/api/v1/jobs/{job_id}/status", json={
        "isActive": False
    }, headers=rec_headers)
    assert pause_res.status_code == 200
    assert pause_res.json()["isActive"] is False

    cand_active_jobs = await client.get("/api/v1/jobs/", headers=cand_headers)
    assert cand_active_jobs.status_code == 200
    assert not any(j["id"] == job_id for j in cand_active_jobs.json())

    # 16. Recruiter deletes job
    del_res = await client.delete(f"/api/v1/jobs/{job_id}", headers=rec_headers)
    assert del_res.status_code == 200


@pytest.mark.asyncio
async def test_recruiter_job_creation_and_contract_validation(client):
    # 1. Register Recruiter
    recruiter_email = f"recruiter_{uuid.uuid4().hex[:8]}@swipex.io"
    rec_reg = await client.post("/api/v1/auth/register", json={
        "email": recruiter_email,
        "password": "Password1234!",
        "fullName": "Recruiter Jane",
        "role": "recruiter"
    })
    assert rec_reg.status_code == 201
    rec_token = rec_reg.json()["access_token"]
    rec_headers = {"Authorization": f"Bearer {rec_token}"}

    # 2. Register Job Seeker
    seeker_email = f"seeker_{uuid.uuid4().hex[:8]}@swipex.io"
    seeker_reg = await client.post("/api/v1/auth/register", json={
        "email": seeker_email,
        "password": "Password1234!",
        "fullName": "Seeker Bob",
        "role": "job_seeker"
    })
    assert seeker_reg.status_code == 201
    seeker_token = seeker_reg.json()["access_token"]
    seeker_headers = {"Authorization": f"Bearer {seeker_token}"}

    # 3. Unauthenticated attempt -> 401
    unauth_res = await client.post("/api/v1/jobs/", json={"title": "Test Job"})
    assert unauth_res.status_code == 401

    # 4. Job Seeker attempt -> 403 Forbidden
    seeker_res = await client.post("/api/v1/jobs/", json={"title": "Test Job"}, headers=seeker_headers)
    assert seeker_res.status_code == 403

    # 5. Invalid payload: missing title -> 422
    empty_title_res = await client.post("/api/v1/jobs/", json={"title": "   "}, headers=rec_headers)
    assert empty_title_res.status_code == 422

    # 6. Invalid payload: min_salary > max_salary -> 422
    invalid_salary_res = await client.post("/api/v1/jobs/", json={
        "title": "Backend Dev",
        "salaryMin": 150000,
        "salaryMax": 100000
    }, headers=rec_headers)
    assert invalid_salary_res.status_code == 422

    # 7. Valid job creation with string comma-separated skills
    create_res = await client.post("/api/v1/jobs/", json={
        "title": "Frontend Developer",
        "department": "Engineering",
        "location": "Remote",
        "salaryMin": 60000,
        "salaryMax": 90000,
        "skillsRequired": "React, TypeScript, JavaScript, HTML, CSS, Tailwind CSS",
        "description": "Build responsive and accessible web applications using React and TypeScript."
    }, headers=rec_headers)
    assert create_res.status_code == 200
    job_data = create_res.json()
    job_id = job_data["id"]
    assert job_data["title"] == "Frontend Developer"
    assert job_data["location"] == "Remote"
    assert "React" in job_data["skillsRequired"]
    assert "TypeScript" in job_data["skillsRequired"]
    assert job_data["isActive"] is True

    # 8. Recruiter sees job in their list
    rec_jobs_res = await client.get("/api/v1/jobs/recruiter/mine", headers=rec_headers)
    assert rec_jobs_res.status_code == 200
    rec_jobs = rec_jobs_res.json()
    assert any(j["id"] == job_id for j in rec_jobs)

    # 9. Job seeker sees the job in the feed / list
    feed_res = await client.get("/api/v1/jobs/", headers=seeker_headers)
    assert feed_res.status_code == 200
    feed_jobs = feed_res.json()
    assert any(j["id"] == job_id for j in feed_jobs)

    # 10. Recruiter pauses job
    pause_res = await client.put(f"/api/v1/jobs/{job_id}/status", json={"isActive": False}, headers=rec_headers)
    assert pause_res.status_code == 200
    assert pause_res.json()["isActive"] is False

    # 11. Recruiter resumes job
    resume_res = await client.put(f"/api/v1/jobs/{job_id}/status", json={"status": "Active"}, headers=rec_headers)
    assert resume_res.status_code == 200
    assert resume_res.json()["isActive"] is True
