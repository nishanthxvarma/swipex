import uuid

class SuggestionGenerator:
    def generate(self, parsed_data: dict) -> list:
        projects = parsed_data.get("projects", [])
        experience = parsed_data.get("experience", [])
        personal_info = parsed_data.get("personalInfo", {})
        skills = parsed_data.get("skills", {})

        suggestions = []

        # 1. Action verbs & metrics in project descriptions
        if projects:
            p1 = projects[0]
            curr_desc = p1.get("description", "Built web application.")
            suggestions.append({
                "id": str(uuid.uuid4()),
                "category": "Impact Metrics",
                "problem": "Generic project description lacking quantitative results.",
                "reason": "ATS screeners and hiring managers prioritize bullet points with measurable impact metrics (e.g., percentage improvements, active users).",
                "current": curr_desc[:80] + "..." if len(curr_desc) > 80 else curr_desc,
                "suggested": "Engineered a high-performance web application utilizing Next.js, FastAPI, and PostgreSQL, serving 5,000+ active users with 99.8% server uptime and sub-100ms API response latency.",
                "impactScore": 15.0
            })

        # 2. GitHub / Portfolio links
        if not personal_info.get("github") or not personal_info.get("portfolio"):
            suggestions.append({
                "id": str(uuid.uuid4()),
                "category": "Online Profiles",
                "problem": "Missing live GitHub repository or portfolio website link.",
                "reason": "Technical recruiters verify code quality and live projects by clicking portfolio links directly from parsed ATS profiles.",
                "current": "Contact: " + personal_info.get("email", "user@example.com"),
                "suggested": f"Portfolio: https://{personal_info.get('name', 'developer').lower().replace(' ', '')}.dev | GitHub: github.com/{personal_info.get('name', 'dev').lower().replace(' ', '')}",
                "impactScore": 12.0
            })

        # 3. Target Job Keywords
        all_skills_count = sum(len(v) for v in skills.values())
        if all_skills_count < 12:
            suggestions.append({
                "id": str(uuid.uuid4()),
                "category": "Keyword Density",
                "problem": "Limited technical keyword coverage for cloud infrastructure.",
                "reason": "Adding high-demand cloud and DevOps keywords (e.g. Docker, AWS, CI/CD) increases search relevance by up to 40%.",
                "current": "Skills: React, JavaScript, Python",
                "suggested": "Skills: React 19, Next.js, Node.js, Python FastAPI, PostgreSQL, Docker, AWS (EC2/S3), Redis, CI/CD Pipelines",
                "impactScore": 18.0
            })

        # 4. Certifications suggestion
        if not parsed_data.get("certifications"):
            suggestions.append({
                "id": str(uuid.uuid4()),
                "category": "Certifications",
                "problem": "No industry-recognized certifications listed.",
                "reason": "Certifications validate domain expertise and boost ATS scoring under educational criteria.",
                "current": "Certifications: None listed",
                "suggested": "Certifications: AWS Certified Solutions Architect - Associate | Meta Front-End Developer Specialization",
                "impactScore": 10.0
            })

        return suggestions

suggestion_generator = SuggestionGenerator()
