import pytest
import io
from app.ai.resume_parser import parser_service
from app.ai.ats_engine import ats_engine
from app.ai.health_report import health_report_generator
from app.ai.suggestion_generator import suggestion_generator
from app.ai.job_matcher import job_matcher_engine
from app.ai.recommendation_engine import ai_recommendation_engine

def test_full_pipeline_end_to_end():
    sample_text = """
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
    # 1. Parse
    parsed = parser_service.parse(sample_text.encode("utf-8"), "txt", "test_resume.txt")
    assert parsed["personalInfo"]["name"] == "Nishanth Varma"
    assert parsed["personalInfo"]["email"] == "nishanth@swipex.io"
    assert "React" in parsed["skills"]["frameworks"]
    assert "FastAPI" in parsed["skills"]["frameworks"]
    assert "PostgreSQL" in parsed["skills"]["databases"]
    assert "Docker" in parsed["skills"]["cloud"]

    # 2. ATS Score
    ats_res = ats_engine.calculate_score(parsed)
    assert ats_res["overallScore"] >= 80.0
    assert ats_res["grade"] == "Green"
    assert "breakdown" in ats_res

    # 3. Health Report
    health = health_report_generator.generate(parsed, ats_res["overallScore"])
    assert len(health["strengths"]) > 0
    assert health["overallReadabilityScore"] > 70.0

    # 4. Suggestions
    suggestions = suggestion_generator.generate(parsed)
    assert isinstance(suggestions, list)

    # 5. Job Match
    match_res = job_matcher_engine.match(
        parsed_data=parsed,
        job_title="Senior Full Stack Engineer",
        required_skills=["React", "TypeScript", "FastAPI", "PostgreSQL"],
        preferred_skills=["Docker", "AWS", "Redis"]
    )
    assert match_res["matchResult"]["matchPercentage"] >= 85.0
    assert "React" in match_res["matchResult"]["satisfiedSkills"]
    assert "PostgreSQL" in match_res["matchResult"]["satisfiedSkills"]

    # 6. Recommendations
    recs = ai_recommendation_engine.recommend(parsed)
    assert len(recs) >= 3
    assert recs[0]["matchPercentage"] > 50.0
