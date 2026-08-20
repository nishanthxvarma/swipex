import pytest
from app.ai.suggestion_generator import suggestion_generator

def test_suggestion_generator_no_hallucinated_metrics():
    candidate_parsed = {
        "personalInfo": {
            "name": "Alex Smith",
            "email": "alex@example.com",
            "linkedin": "",
            "github": ""
        },
        "projects": [{
            "id": "proj_1",
            "title": "Inventory Management Tool",
            "technologies": ["Python", "SQLite"],
            "description": "Created desktop application for tracking local warehouse inventory."
        }],
        "experience": [{
            "id": "exp_1",
            "company": "Local Retail",
            "role": "IT Assistant",
            "duration": "2022 - 2023",
            "description": "Maintained internal databases and assisted with software troubleshooting."
        }],
        "skills": {
            "programmingLanguages": ["Python", "SQL"],
            "frameworks": [],
            "databases": ["SQLite"],
            "cloud": [],
            "tools": ["Git"]
        },
        "certifications": []
    }

    suggestions = suggestion_generator.generate(candidate_parsed)
    assert len(suggestions) > 0

    # Ensure suggestions do not invent specific fabricated claims (like "5,000+ active users with 99.8% uptime")
    for s in suggestions:
        assert "5,000+" not in s["suggested"]
        assert "99.8%" not in s["suggested"]
        # Must contain guidance or placeholders
        if s["category"] in ("Impact Metrics", "Experience Impact"):
            assert "[add a truthful metric" in s["suggested"] or "[insert truthful" in s["suggested"]
