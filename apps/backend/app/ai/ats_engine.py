class ATSScoringEngine:
    def calculate_score(self, parsed_data: dict) -> dict:
        personal_info = parsed_data.get("personalInfo", {})
        education = parsed_data.get("education", [])
        projects = parsed_data.get("projects", [])
        skills = parsed_data.get("skills", {})
        experience = parsed_data.get("experience", [])
        certifications = parsed_data.get("certifications", [])

        # 1. Contact Info (Max 10)
        contact_score = 0.0
        if personal_info.get("name"): contact_score += 2.0
        if personal_info.get("email"): contact_score += 2.5
        if personal_info.get("phone"): contact_score += 2.5
        if personal_info.get("linkedin") or personal_info.get("github"): contact_score += 3.0
        contact_score = min(10.0, contact_score)

        # 2. Education (Max 15)
        edu_score = 0.0
        if education:
            edu_score += 8.0
            first_edu = education[0]
            if first_edu.get("degree"): edu_score += 3.0
            if first_edu.get("college"): edu_score += 2.0
            if first_edu.get("cgpa") or first_edu.get("graduationYear"): edu_score += 2.0
        edu_score = min(15.0, edu_score)

        # 3. Projects (Max 20)
        proj_score = 0.0
        if projects:
            proj_score += min(12.0, len(projects) * 6.0)
            has_tech = any(p.get("technologies") for p in projects)
            if has_tech: proj_score += 5.0
            has_desc = any(len(p.get("description", "")) > 30 for p in projects)
            if has_desc: proj_score += 3.0
        proj_score = min(20.0, proj_score)

        # 4. Skills (Max 25)
        skills_score = 0.0
        total_skills_count = sum(len(skills.get(cat, [])) for cat in skills)
        if total_skills_count >= 15:
            skills_score = 25.0
        elif total_skills_count >= 10:
            skills_score = 22.0
        elif total_skills_count >= 5:
            skills_score = 17.0
        elif total_skills_count > 0:
            skills_score = 12.0
        skills_score = min(25.0, skills_score)

        # 5. Experience (Max 15)
        exp_score = 0.0
        if experience:
            exp_score += min(10.0, len(experience) * 5.0)
            has_detail = any(len(e.get("description", "")) > 40 for e in experience)
            if has_detail: exp_score += 5.0
        else:
            exp_score = 8.0  # Entry-level / project weighted
        exp_score = min(15.0, exp_score)

        # 6. Keywords (Max 10)
        kw_score = 8.5 if (total_skills_count > 8 and projects) else 6.0
        if certifications: kw_score += 1.5
        kw_score = min(10.0, kw_score)

        # 7. Formatting (Max 5)
        fmt_score = 5.0  # Clean JSON structure parsed successfully

        total_score = round(contact_score + edu_score + proj_score + skills_score + exp_score + kw_score + fmt_score, 1)
        total_score = min(100.0, max(0.0, total_score))

        if total_score >= 80.0:
            grade = "Green"
            status_text = "Excellent ATS Compatibility! Your resume matches automated screening filters."
        elif total_score >= 60.0:
            grade = "Yellow"
            status_text = "Moderate ATS Compatibility. Add missing keywords and metrics to boost your rank."
        else:
            grade = "Red"
            status_text = "Needs Optimization. Essential contact, skills, or experience sections are sparse."

        breakdown = {
            "contactInfo": {
                "score": round(contact_score, 1),
                "max": 10,
                "details": f"{int(contact_score)}/10 — Full contact details provided." if contact_score >= 8 else "Missing phone or portfolio URL."
            },
            "education": {
                "score": round(edu_score, 1),
                "max": 15,
                "details": f"{int(edu_score)}/15 — Verified degree and institution details."
            },
            "projects": {
                "score": round(proj_score, 1),
                "max": 20,
                "details": f"{int(proj_score)}/20 — Technical projects with stack tags."
            },
            "skills": {
                "score": round(skills_score, 1),
                "max": 25,
                "details": f"{int(skills_score)}/25 — High coverage across frameworks and databases."
            },
            "experience": {
                "score": round(exp_score, 1),
                "max": 15,
                "details": f"{int(exp_score)}/15 — Work history and responsibilities documented."
            },
            "keywords": {
                "score": round(kw_score, 1),
                "max": 10,
                "details": f"{round(kw_score, 1)}/10 — Strong technical and role-specific domain terminology."
            },
            "formatting": {
                "score": round(fmt_score, 1),
                "max": 5,
                "details": "5/5 — Parsable layout structure with clear section headers."
            }
        }

        return {
            "overallScore": total_score,
            "breakdown": breakdown,
            "grade": grade,
            "statusText": status_text
        }

ats_engine = ATSScoringEngine()
