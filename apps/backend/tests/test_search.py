import pytest

@pytest.mark.asyncio
async def test_global_search_and_suggestions(client, db_session):
    # 1. Create company and job in test DB
    from app.models.job import CompanyModel, JobModel
    company = CompanyModel(name="Cybernetics Cloud", industry="Cloud Infrastructure")
    db_session.add(company)
    await db_session.commit()
    await db_session.refresh(company)

    job = JobModel(
        company_id=company.id,
        title="Principal Cloud Security Architect",
        description="Lead global cloud security architectures",
        requirements="Kubernetes, AWS, IAM, Zero Trust",
        is_active=True
    )
    db_session.add(job)
    await db_session.commit()

    # 2. Search as authenticated job seeker
    cand_res = await client.post("/api/v1/auth/register", json={
        "email": "searcher_user@swipex.io",
        "password": "Password1234!",
        "fullName": "Searcher User",
        "role": "job_seeker"
    })
    cand_token = cand_res.json()["access_token"]
    cand_headers = {"Authorization": f"Bearer {cand_token}"}

    search_res = await client.get("/api/v1/search/?q=Cloud", headers=cand_headers)
    assert search_res.status_code == 200
    data = search_res.json()
    assert len(data["jobs"]) >= 1
    assert any(j["title"] == "Principal Cloud Security Architect" for j in data["jobs"])
    assert any(c["name"] == "Cybernetics Cloud" for c in data["companies"])
    # Candidate should not see other candidates
    assert len(data["candidates"]) == 0

    # 3. Search suggestions
    sugg_res = await client.get("/api/v1/search/suggestions?q=Cyber")
    assert sugg_res.status_code == 200
    suggestions = sugg_res.json()
    assert any("Cybernetics Cloud" in s for s in suggestions)

@pytest.mark.asyncio
async def test_recruiter_candidate_search(client):
    # 1. Register candidate
    await client.post("/api/v1/auth/register", json={
        "email": "talented_dev@swipex.io",
        "password": "Password1234!",
        "fullName": "Talented Rust Developer",
        "role": "job_seeker"
    })

    # 2. Register recruiter
    rec_res = await client.post("/api/v1/auth/register", json={
        "email": "search_recruiter@swipex.io",
        "password": "Password1234!",
        "fullName": "Search Recruiter",
        "role": "recruiter"
    })
    rec_token = rec_res.json()["access_token"]
    rec_headers = {"Authorization": f"Bearer {rec_token}"}

    # 3. Recruiter searches for candidate
    rec_search = await client.get("/api/v1/search/?q=Talented&category=candidates", headers=rec_headers)
    assert rec_search.status_code == 200
    cand_results = rec_search.json()["candidates"]
    assert len(cand_results) >= 1
    assert any("Talented" in c["name"] for c in cand_results)
