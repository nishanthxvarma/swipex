import pytest
import io
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.ai.resume_parser import parser_service
from app.ai.ats_engine import ats_engine
from app.ai.health_report import health_report_generator
from app.ai.suggestion_generator import suggestion_generator
from app.ai.job_matcher import job_matcher_engine
from app.ai.recommendation_engine import ai_recommendation_engine
from app.core.security import create_access_token

SAMPLE_RESUME_TEXT = """
Nishanth Varma
nishanth@swipex.io | +1 (555) 349-2810 | linkedin.com/in/nishanthvarma | github.com/nishanthxvarma
San Francisco, CA

SUMMARY
Senior Software Architect specializing in React 19, Next.js 15, FastAPI, and PostgreSQL microservices.

SKILLS
Programming Languages: TypeScript, Python, SQL, JavaScript, HTML5, CSS3
Frameworks & Libraries: React, Next.js, FastAPI, Node.js, Zustand, Tailwind CSS
Databases & Cache: PostgreSQL, Redis, MongoDB
Cloud & DevOps: Docker, Kubernetes, Amazon Web Services (AWS), GitHub Actions, Terraform

EXPERIENCE
Lead Full Stack Engineer | SwipeX Technologies | 2023 - Present
- Architected Next.js 15 App Router frontend and FastAPI microservices.
- Reduced API response latency by 42% and automated ATS scoring engines.

Full Stack Developer | Vanguard Systems | 2021 - 2023
- Developed responsive dashboard UI components and optimized PostgreSQL queries.

EDUCATION
B.S. Computer Science & Software Engineering | Stanford University | 2021
CGPA: 3.92 / 4.0

PROJECTS
AI Resume Analysis & ATS Engine | TypeScript, Next.js, FastAPI, PostgreSQL
- Built layout-aware document parser and deterministic 6-pillar ATS scoring engine.

CERTIFICATIONS
AWS Certified Solutions Architect
"""

@pytest.mark.asyncio
async def test_full_pipeline_end_to_end():
    parsed = parser_service.parse(SAMPLE_RESUME_TEXT.encode("utf-8"), "txt", "test_resume.txt")
    assert parsed["personalInfo"]["name"] == "Nishanth Varma"
    assert parsed["personalInfo"]["email"] == "nishanth@swipex.io"
    assert "React" in parsed["skills"]["frameworks"]
    assert "FastAPI" in parsed["skills"]["frameworks"]
    assert "PostgreSQL" in parsed["skills"]["databases"]
    assert "Docker" in parsed["skills"]["cloud"]

    ats_res = ats_engine.calculate_score(parsed)
    assert ats_res["overallScore"] >= 80.0
    assert ats_res["grade"] == "Green"
    assert "breakdown" in ats_res

    health = health_report_generator.generate(parsed, ats_res["overallScore"])
    assert len(health["strengths"]) > 0
    assert health["overallReadabilityScore"] > 70.0

    suggestions = suggestion_generator.generate(parsed)
    assert isinstance(suggestions, list)

    match_res = job_matcher_engine.match(
        parsed_data=parsed,
        job_title="Senior Full Stack Engineer",
        required_skills=["React", "TypeScript", "FastAPI", "PostgreSQL"],
        preferred_skills=["Docker", "AWS", "Redis"]
    )
    assert match_res["matchResult"]["matchPercentage"] >= 85.0
    assert "React" in match_res["matchResult"]["satisfiedSkills"]
    assert "PostgreSQL" in match_res["matchResult"]["satisfiedSkills"]

    recs = ai_recommendation_engine.recommend(parsed)
    assert len(recs) >= 3
    assert recs[0]["matchPercentage"] > 50.0

@pytest.mark.asyncio
async def test_resume_upload_endpoint_matches_frontend_contract(client: AsyncClient, auth_headers: dict):
    # Test /upload (primary contract with PDF)
    files = {"file": ("my_resume.pdf", SAMPLE_RESUME_TEXT.encode("utf-8"), "application/pdf")}
    res_upload = await client.post("/api/v1/resumes/upload", headers=auth_headers, files=files)
    assert res_upload.status_code == 201
    data = res_upload.json()
    assert data["originalName"] == "my_resume.pdf"
    assert data["atsScore"] >= 80.0
    assert data["parsedData"]["personalInfo"]["email"] == "nishanth@swipex.io"

    # Test /uploadResume (alias contract with DOCX)
    files_alias = {"file": ("my_resume_v2.docx", SAMPLE_RESUME_TEXT.encode("utf-8"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    res_alias = await client.post("/api/v1/resumes/uploadResume", headers=auth_headers, files=files_alias)
    assert res_alias.status_code == 201
    data_alias = res_alias.json()
    assert data_alias["originalName"] == "my_resume_v2.docx"

@pytest.mark.asyncio
async def test_invalid_file_type(client: AsyncClient, auth_headers: dict):
    files = {"file": ("malicious.exe", b"binary content", "application/octet-stream")}
    res = await client.post("/api/v1/resumes/upload", headers=auth_headers, files=files)
    assert res.status_code == 400
    assert "Unsupported file format" in res.json()["detail"]

@pytest.mark.asyncio
async def test_empty_document(client: AsyncClient, auth_headers: dict):
    files = {"file": ("empty.pdf", b"", "application/pdf")}
    res = await client.post("/api/v1/resumes/upload", headers=auth_headers, files=files)
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

@pytest.mark.asyncio
async def test_oversized_file(client: AsyncClient, auth_headers: dict):
    oversized_bytes = b"0" * (6 * 1024 * 1024)  # 6MB
    files = {"file": ("large.pdf", oversized_bytes, "application/pdf")}
    res = await client.post("/api/v1/resumes/upload", headers=auth_headers, files=files)
    assert res.status_code == 400
    assert "exceeds" in res.json()["detail"].lower()

@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    files = {"file": ("resume.pdf", b"test", "application/pdf")}
    res = await client.post("/api/v1/resumes/upload", files=files)
    assert res.status_code == 401

@pytest.mark.asyncio
async def test_resume_analysis_and_versions(client: AsyncClient, auth_headers: dict):
    # 1. Upload initial resume v1
    files_v1 = {"file": ("resume_v1.pdf", SAMPLE_RESUME_TEXT.encode("utf-8"), "application/pdf")}
    res_v1 = await client.post("/api/v1/resumes/upload", headers=auth_headers, files=files_v1)
    assert res_v1.status_code == 201
    resume_v1_id = res_v1.json()["id"]
    score_v1 = res_v1.json()["atsScore"]

    # 2. Upload second resume v2
    resume_text_v2 = SAMPLE_RESUME_TEXT + "\nGraphQL, Docker, Kubernetes, AWS\n"
    files_v2 = {"file": ("resume_v2.docx", resume_text_v2.encode("utf-8"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    res_v2 = await client.post("/api/v1/resumes/upload", headers=auth_headers, files=files_v2)
    assert res_v2.status_code == 201
    resume_v2_id = res_v2.json()["id"]

    # 3. Verify version list has both versions with immutable scores
    res_versions = await client.get("/api/v1/resumes/versions", headers=auth_headers)
    assert res_versions.status_code == 200
    versions = res_versions.json()
    assert len(versions) >= 2

    # 4. Verify switching active version back to v1
    res_set_active = await client.post(f"/api/v1/resumes/setActive/{resume_v1_id}", headers=auth_headers)
    assert res_set_active.status_code == 200
    assert res_set_active.json()["id"] == resume_v1_id
    assert res_set_active.json()["isActive"] is True

    # 5. Check profile synchronization
    res_sync = await client.post("/api/v1/resumes/sync-profile", headers=auth_headers)
    assert res_sync.status_code == 200
    assert res_sync.json()["success"] is True

    # 6. Verify profile has received parsed data
    res_profile = await client.get("/api/v1/users/profile", headers=auth_headers)
    assert res_profile.status_code == 200
    profile_data = res_profile.json()
    assert profile_data["fullName"] == "Nishanth Varma"
    assert "TypeScript" in profile_data["skills"]

    # 7. Delete version v2
    res_delete = await client.delete(f"/api/v1/resumes/{resume_v2_id}", headers=auth_headers)
    assert res_delete.status_code == 200
    assert res_delete.json()["success"] is True
