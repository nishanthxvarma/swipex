import pytest
from app.ai.ats_engine import ats_engine

def test_ats_score_reproducibility():
    sample_parsed = {
        "personalInfo": {
            "name": "Jane Smith",
            "email": "jane@example.com",
            "phone": "+1 555-123-4567",
            "linkedin": "linkedin.com/in/janesmith",
            "github": "github.com/janesmith"
        },
        "education": [{
            "id": "edu_1",
            "degree": "B.S. Computer Science",
            "college": "UC Berkeley",
            "graduationYear": "2020"
        }],
        "skills": {
            "programmingLanguages": ["Python", "TypeScript", "SQL"],
            "frameworks": ["FastAPI", "React", "Next.js"],
            "databases": ["PostgreSQL", "Redis"],
            "cloud": ["Docker", "Kubernetes", "Amazon Web Services (AWS)"],
            "tools": ["Git", "GitHub Actions"]
        },
        "experience": [{
            "id": "exp_1",
            "company": "Acme Corp",
            "role": "Senior Engineer",
            "duration": "2020 - Present",
            "description": "Architected microservices using Python FastAPI, improving throughput by 40%."
        }],
        "projects": [{
            "id": "proj_1",
            "title": "Cloud Orchestrator",
            "technologies": ["Python", "Docker"],
            "description": "Built distributed system processing 50k events daily."
        }],
        "certifications": ["AWS Certified Solutions Architect"]
    }

    run1 = ats_engine.calculate_score(sample_parsed)
    run2 = ats_engine.calculate_score(sample_parsed)

    assert run1["overallScore"] == run2["overallScore"]
    assert run1["grade"] == run2["grade"]
    assert run1["breakdown"] == run2["breakdown"]
    assert run1["overallScore"] >= 80.0
    assert run1["grade"] == "Green"

def test_ats_score_sparse_resume_threshold_under_80():
    sparse_parsed = {
        "personalInfo": {
            "name": "Applicant",
            "email": "",
            "phone": ""
        },
        "education": [],
        "skills": {
            "programmingLanguages": ["Python"],
            "frameworks": [],
            "databases": [],
            "cloud": [],
            "tools": []
        },
        "experience": [],
        "projects": [],
        "certifications": []
    }

    res = ats_engine.calculate_score(sparse_parsed)
    assert res["overallScore"] < 65.0
    assert res["grade"] == "Red"
    assert len(res["missingItems"]) > 0
