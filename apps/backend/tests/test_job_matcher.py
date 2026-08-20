import pytest
from app.ai.job_matcher import job_matcher_engine

def test_job_matcher_no_substring_false_positives():
    # User has React and Django, but NOT C or Go
    candidate_parsed = {
        "skills": {
            "programmingLanguages": ["Python", "JavaScript"],
            "frameworks": ["React", "Django"],
            "databases": ["PostgreSQL"],
            "cloud": ["Docker"]
        },
        "projects": [],
        "experience": []
    }

    # Job requires C and Go
    res = job_matcher_engine.match(
        parsed_data=candidate_parsed,
        job_title="Systems Engineer",
        required_skills=["C", "Go", "Rust"]
    )

    satisfied = res["matchResult"]["satisfiedSkills"]
    missing = res["matchResult"]["missingSkills"]

    # 'C' should NOT be matched just because 'React' contains 'c'
    assert "C" not in satisfied
    assert "Go" not in satisfied
    assert "C" in missing
    assert "Go" in missing

def test_job_matcher_alias_matching():
    # Candidate lists 'k8s' and 'Postgres', Job requires 'Kubernetes' and 'PostgreSQL'
    candidate_parsed = {
        "skills": {
            "programmingLanguages": ["Python"],
            "databases": ["Postgres"],
            "cloud": ["k8s"]
        },
        "projects": [],
        "experience": []
    }

    res = job_matcher_engine.match(
        parsed_data=candidate_parsed,
        job_title="DevOps Engineer",
        required_skills=["Kubernetes", "PostgreSQL"]
    )

    satisfied = res["matchResult"]["satisfiedSkills"]
    assert "Kubernetes" in satisfied
    assert "PostgreSQL" in satisfied
    assert res["matchResult"]["matchPercentage"] > 70.0
