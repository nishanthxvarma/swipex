import pytest

@pytest.mark.asyncio
async def test_company_crud_and_querying(client, db_session):
    # 1. Register Recruiter
    rec_res = await client.post("/api/v1/auth/register", json={
        "email": "company_recruiter@swipex.io",
        "password": "Password1234!",
        "fullName": "Recruiter Company Admin",
        "role": "recruiter"
    })
    rec_token = rec_res.json()["access_token"]
    rec_headers = {"Authorization": f"Bearer {rec_token}"}

    # 2. Recruiter creates a new company
    comp_payload = {
        "name": "Nova Dynamics",
        "industry": "Robotics",
        "size": "200-500",
        "website": "https://novadynamics.com",
        "description": "Building autonomous robotic operating systems.",
        "techStack": ["Rust", "C++", "Python", "ROS2", "Next.js"],
        "benefits": ["Equity Grants", "Full Relocation", "Comprehensive Healthcare"],
        "headquarters": "Boston, MA",
        "employeeCount": 250,
        "rating": 4.9
    }
    create_res = await client.post("/api/v1/companies/", json=comp_payload, headers=rec_headers)
    assert create_res.status_code == 200
    comp_data = create_res.json()
    assert comp_data["name"] == "Nova Dynamics"
    comp_id = comp_data["id"]

    # 3. Add a job for this company
    from app.models.job import JobModel
    import uuid
    job = JobModel(
        company_id=uuid.UUID(comp_id),
        title="Senior Robotics Control Engineer",
        description="Design trajectory generation algorithms",
        is_active=True,
        salary_min=180000.0,
        salary_max=240000.0
    )
    db_session.add(job)
    await db_session.commit()

    # 4. List companies with industry filter
    list_res = await client.get("/api/v1/companies/?industry=Robotics")
    assert list_res.status_code == 200
    companies = list_res.json()
    assert len(companies) >= 1
    assert any(c["name"] == "Nova Dynamics" for c in companies)

    # 5. Get company details with active jobs
    get_res = await client.get(f"/api/v1/companies/{comp_id}")
    assert get_res.status_code == 200
    detail = get_res.json()
    assert detail["name"] == "Nova Dynamics"
    assert "jobs" in detail
    assert len(detail["jobs"]) >= 1
    assert detail["jobs"][0]["title"] == "Senior Robotics Control Engineer"

    # 6. Recruiter updates company
    update_res = await client.put(f"/api/v1/companies/{comp_id}", json={"rating": 5.0, "size": "500-1000"}, headers=rec_headers)
    assert update_res.status_code == 200
    assert update_res.json()["rating"] == 5.0

@pytest.mark.asyncio
async def test_candidate_forbidden_from_company_mutations(client):
    cand_res = await client.post("/api/v1/auth/register", json={
        "email": "cand_company_test@swipex.io",
        "password": "Password1234!",
        "fullName": "Cand Test",
        "role": "job_seeker"
    })
    token = cand_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.post("/api/v1/companies/", json={"name": "Illegal Company"}, headers=headers)
    assert res.status_code == 403
