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

def test_candidate_real_resume_regression_fixture():
    resume_text = b"""
Nishanth Varma Gottumukkala
+91 9391152853 | nishanthvarma2007@gmail.com | linkedin.com/in/nishanthvarma | github.com/nishanthvarma | leetcode.com/nishanthvarma
Visakhapatnam, India

EDUCATION
Vignan's Institute of Information Technology
Bachelor of Technology in Computer Science and Engineering
CGPA: 9.33 / 10.0 | 2021 - 2025
Relevant Coursework: Data Structures & Algorithms, Database Management Systems, Operating Systems, Computer Networks, Object-Oriented Programming

SKILLS & TECHNOLOGIES
Programming Languages: Python, Java, C, JavaScript, SQL, HTML/CSS
Frameworks & Libraries: React, Node.js, Express.js, Tailwind CSS, Next.js
Databases: MongoDB, PostgreSQL, MySQL
Cloud & DevOps: Google Cloud Platform (GCP), Git, GitHub, Docker
Developer Tools: VS Code, Postman, Linux

PROJECTS
Data Verace | Python, React, FastAPI, PostgreSQL, Machine Learning
- Designed and engineered an automated data verification and authenticity platform analyzing high-volume document pipelines.
- Built an interactive React dashboard with RESTful APIs, reducing data mismatch detection latency by 45%.
- Implemented robust validation algorithms handling structured schemas with 99.2% accuracy.

Smart Hall Booking & Faculty Approval System | React, Node.js, Express.js, MongoDB
- Architected an end-to-end institutional hall reservation workflow with multi-level role-based faculty approval routing.
- Integrated real-time booking clash detection, eliminating double bookings across 12 campus seminar halls.
- Implemented JWT authentication and automated email status updates for over 2,000 active students and faculty.

EXPERIENCE
AlgoZenith VIIT - Student Chapter | Event Manager & Technical Lead
August 2023 - Present | Visakhapatnam, India
- Organized and conducted 10+ competitive programming contests, technical workshops, and hackathons with 500+ participants.
- Mentored junior engineers on Data Structures, Algorithms, and full-stack web development best practices.
- Managed technical logistics, event schedules, and cross-functional teams to ensure seamless event execution.

CERTIFICATIONS
- Google Cloud Certified - Cloud Digital Leader
- HackerRank Certified - Problem Solving (Intermediate), Python, SQL
- Postman API Fundamentals Student Expert

ACHIEVEMENTS
- Solved 400+ Data Structures & Algorithms problems across LeetCode, Codeforces, and GeeksforGeeks.
- 1st Place Winner in VIIT Annual Hackathon among 50+ participating engineering teams.
- Maintained top 5% academic standing with a 9.33 CGPA throughout undergraduate program.
"""
    from app.ai.ats_engine import ats_engine
    parsed = parser_service.parse(resume_text, "txt", "NV_Resume.pdf")

    # Assertions for Section 14 & 15 acceptance criteria:
    assert parsed["personalInfo"]["name"] == "Nishanth Varma Gottumukkala"
    assert parsed["personalInfo"]["email"] == "nishanthvarma2007@gmail.com"
    assert "+91 9391152853" in parsed["personalInfo"]["phone"]
    assert "linkedin.com/in/nishanthvarma" in parsed["personalInfo"]["linkedin"]
    assert "github.com/nishanthvarma" in parsed["personalInfo"]["github"]
    assert "leetcode.com/nishanthvarma" in parsed["personalInfo"]["portfolio"]

    # Education assertions
    assert len(parsed["education"]) >= 1
    assert "Vignan" in parsed["education"][0]["college"]
    assert "Bachelor" in parsed["education"][0]["degree"] or "Technology" in parsed["education"][0]["degree"]
    assert "9.33" in parsed["education"][0]["cgpa"]

    # Project assertions
    assert len(parsed["projects"]) >= 2
    proj_titles = [p["title"] for p in parsed["projects"]]
    assert any("Data Verace" in t for t in proj_titles)
    assert any("Smart Hall Booking" in t for t in proj_titles)

    # Experience assertions
    assert len(parsed["experience"]) >= 1
    assert any("AlgoZenith" in e["company"] or "Event Manager" in e["role"] for e in parsed["experience"])

    # Skills assertions
    skills = parsed["skills"]
    assert "Python" in skills["programmingLanguages"]
    assert "Java" in skills["programmingLanguages"]
    assert "C" in skills["programmingLanguages"]
    assert "React" in skills["frameworks"]
    assert "Node.js" in skills["frameworks"]
    assert "MongoDB" in skills["databases"]
    assert "PostgreSQL" in skills["databases"]
    assert "Google Cloud Platform (GCP)" in skills["cloud"]

    # Certifications & Achievements
    assert len(parsed["certifications"]) >= 2
    assert len(parsed["achievements"]) >= 2

    # ATS Scoring assertions
    ats = ats_engine.calculate_score(parsed)
    assert ats["overallScore"] >= 85.0
    assert ats["breakdown"]["contactInfo"]["score"] >= 8.0
    assert ats["breakdown"]["skills"]["score"] >= 20.0
    assert ats["breakdown"]["projects"]["score"] >= 15.0
    assert ats["breakdown"]["education"]["score"] >= 12.0

