import pytest
from app.ai.resume_parser import parser_service
from app.ai.taxonomy import normalize_skill, extract_skills_from_text

def test_skill_normalization_aliases():
    assert normalize_skill("Postgres") == "PostgreSQL"
    assert normalize_skill("postgresql") == "PostgreSQL"
    assert normalize_skill("k8s") == "Kubernetes"
    assert normalize_skill("react.js") == "React"
    assert normalize_skill("golang") == "Go"
    assert normalize_skill("aws") == "Amazon Web Services (AWS)"
    assert normalize_skill("gcp") == "Google Cloud Platform (GCP)"
    assert normalize_skill("ci/cd") == "CI/CD"

def test_extract_skills_boundary_safety():
    # Verify that single-letter skills like 'C' or short skills like 'Go' are matched safely without false positives
    text_with_c = "Experienced in C programming and C++ development."
    skills_c = extract_skills_from_text(text_with_c)
    prog_skills = [s[0] for s in skills_c["programmingLanguages"]]
    assert "C" in prog_skills
    assert "C++" in prog_skills

    # Verify that words like 'React' or 'Django' do not trigger 'C' or 'Go'
    clean_text = "Built applications using React, Django, and JavaScript."
    skills_clean = extract_skills_from_text(clean_text)
    clean_prog = [s[0] for s in skills_clean["programmingLanguages"]]
    assert "C" not in clean_prog
    assert "Go" not in clean_prog
    assert "JavaScript" in clean_prog

def test_resume_parser_empty_document_no_hallucinations():
    # Verify that an empty or minimal document does NOT produce hardcoded fake Stanford or TechCorp data
    minimal_text = b"John Doe\njohn.doe@example.com\n+1 (555) 123-4567\n"
    parsed = parser_service.parse(minimal_text, "txt", "john_doe.txt")
    
    assert parsed["personalInfo"]["name"] == "John Doe"
    assert parsed["personalInfo"]["email"] == "john.doe@example.com"
    assert parsed["personalInfo"]["phone"] == "+1 (555) 123-4567"
    
    # Must NOT contain hardcoded fake education
    for edu in parsed["education"]:
        assert "Stanford" not in edu.get("college", "")
        
    # Must NOT contain hardcoded fake experience
    for exp in parsed["experience"]:
        assert "TechCorp" not in exp.get("company", "")
        assert "Vanguard" not in exp.get("company", "")

def test_resume_parser_structured_extraction():
    sample_resume = b"""
Jane Smith
jane.smith@techdomain.io | +1 555-987-6543 | linkedin.com/in/janesmith | github.com/janesmith
San Francisco, CA

SUMMARY
Senior Software Engineer with 6+ years of experience building scalable backend microservices.

SKILLS
Languages: Python, TypeScript, Go, SQL
Frameworks: FastAPI, Django, React, Next.js
Databases: PostgreSQL, Redis, MongoDB
Cloud & DevOps: Docker, Kubernetes, AWS, Terraform, GitHub Actions

EXPERIENCE
Lead Backend Engineer | Acme Cloud Systems | 2022 - Present
- Architected high-throughput REST APIs using FastAPI and PostgreSQL.
- Reduced database query latency by 45% and scaled Redis caching.

Software Engineer | Stellar Labs | 2019 - 2022
- Developed event-driven microservices using Python and Docker on AWS.

EDUCATION
B.S. Computer Science | University of California, Berkeley | 2019
CGPA: 3.85 / 4.0

PROJECTS
Distributed Task Pipeline | Python, Redis, Docker
- Implemented asynchronous task orchestration handling 10k tasks/sec.

CERTIFICATIONS
AWS Certified Solutions Architect
"""
    parsed = parser_service.parse(sample_resume, "txt", "jane_smith_resume.txt")

    assert parsed["personalInfo"]["name"] == "Jane Smith"
    assert parsed["personalInfo"]["email"] == "jane.smith@techdomain.io"
    assert "linkedin.com/in/janesmith" in parsed["personalInfo"]["linkedin"]
    assert "github.com/janesmith" in parsed["personalInfo"]["github"]

    skills = parsed["skills"]
    assert "Python" in skills["programmingLanguages"]
    assert "TypeScript" in skills["programmingLanguages"]
    assert "FastAPI" in skills["frameworks"]
    assert "PostgreSQL" in skills["databases"]
    assert "Docker" in skills["cloud"]

    assert len(parsed["experience"]) >= 2
    assert len(parsed["education"]) >= 1
    assert "Berkeley" in parsed["education"][0]["college"] or "University" in parsed["education"][0]["college"]
    assert len(parsed["certifications"]) >= 1
