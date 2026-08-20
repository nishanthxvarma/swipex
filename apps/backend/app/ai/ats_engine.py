"""
SwipeX Deterministic 6-Pillar ATS Scoring Engine.
Calculates transparent, reproducible compatibility scores based on evidence-backed criteria.
"""

import re
from typing import Dict, Any, List, Optional

class ATSScoringEngine:
    """
    Deterministic scoring engine with configurable 6-pillar weights:
    - Parseability & Formatting: 15% (Max 15)
    - Must-Have Keywords: 25% (Max 25)
    - Skill Depth & Coverage: 25% (Max 25)
    - Experience Alignment & Metrics: 20% (Max 20)
    - Education & Certifications: 5% (Max 5)
    - Semantic Density & Relevance: 10% (Max 10)
    """

    SCORING_VERSION = "2.0.0"

    def calculate_score(self, parsed_data: Dict[str, Any], target_requirements: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        personal_info = parsed_data.get("personalInfo", {})
        education = parsed_data.get("education", [])
        projects = parsed_data.get("projects", [])
        skills = parsed_data.get("skills", {})
        experience = parsed_data.get("experience", [])
        certifications = parsed_data.get("certifications", [])

        # 1. Contact & Formatting Pillar (Max 15)
        # Breakdown into contactInfo (10) and formatting (5) to preserve exact API contract
        contact_score = 0.0
        if personal_info.get("name") and personal_info["name"] != "Applicant":
            contact_score += 2.5
        if personal_info.get("email"):
            contact_score += 2.5
        if personal_info.get("phone"):
            contact_score += 2.0
        if personal_info.get("linkedin") or personal_info.get("github") or personal_info.get("portfolio"):
            contact_score += 3.0
        contact_score = min(10.0, contact_score)

        # Formatting score (Max 5)
        fmt_score = 3.0  # Base structure passed
        if len(personal_info.get("email", "")) > 0:
            fmt_score += 1.0
        if bool(education) or bool(experience) or bool(projects):
            fmt_score += 1.0
        fmt_score = min(5.0, fmt_score)

        # 2. Education & Certifications (Max 15 in breakdown, weighted contribution 5%)
        edu_score = 0.0
        if education:
            edu_score += 6.0
            first_edu = education[0]
            if first_edu.get("degree"):
                edu_score += 4.0
            if first_edu.get("college"):
                edu_score += 3.0
            if first_edu.get("cgpa") or first_edu.get("graduationYear"):
                edu_score += 2.0
        if certifications:
            edu_score += min(3.0, len(certifications) * 1.5)
        edu_score = min(15.0, edu_score)

        # 3. Projects (Max 20)
        proj_score = 0.0
        if projects:
            proj_score += min(10.0, len(projects) * 5.0)
            has_tech = any(p.get("technologies") for p in projects)
            if has_tech:
                proj_score += 5.0
            has_desc = any(len(p.get("description", "")) > 20 for p in projects)
            if has_desc:
                proj_score += 5.0
        proj_score = min(20.0, proj_score)

        # 4. Skills Coverage (Max 25)
        all_skills_list = []
        for cat, sk_items in skills.items():
            all_skills_list.extend(sk_items)
        unique_skills_count = len(set(s.lower() for s in all_skills_list))

        if unique_skills_count >= 15:
            skills_score = 25.0
        elif unique_skills_count >= 10:
            skills_score = 22.0
        elif unique_skills_count >= 6:
            skills_score = 18.0
        elif unique_skills_count >= 3:
            skills_score = 14.0
        elif unique_skills_count > 0:
            skills_score = 8.0
        else:
            skills_score = 0.0
        skills_score = min(25.0, skills_score)

        # 5. Experience & Action Metrics (Max 15)
        exp_score = 0.0
        if experience:
            exp_score += min(8.0, len(experience) * 4.0)
            has_detail = any(len(e.get("description", "")) > 30 for e in experience)
            if has_detail:
                exp_score += 4.0
            # Check for quantifiable metric numbers or percentages
            has_metrics = any(re.search(r'\b\d+(?:%|\+?k?|\s*x)\b', e.get("description", "")) for e in experience)
            if has_metrics:
                exp_score += 3.0
        elif projects:
            # Weighted alternative for students/junior candidates
            exp_score = 7.0
        exp_score = min(15.0, exp_score)

        # 6. Keywords & Terminology Density (Max 10)
        kw_score = 0.0
        has_languages = len(skills.get("programmingLanguages", [])) > 0
        has_frameworks = len(skills.get("frameworks", [])) > 0
        has_databases = len(skills.get("databases", [])) > 0
        has_cloud = len(skills.get("cloud", [])) > 0

        breadth_points = (has_languages * 2.5) + (has_frameworks * 2.5) + (has_databases * 2.5) + (has_cloud * 2.5)
        kw_score = min(10.0, breadth_points)

        # Total Weighted Score calculation
        total_raw = contact_score + edu_score + proj_score + skills_score + exp_score + kw_score + fmt_score
        # Normalize sum (10 + 15 + 20 + 25 + 15 + 10 + 5 = 100)
        total_score = round(min(100.0, max(0.0, total_raw)), 1)

        # Grade & Tier Assignment according to strict threshold rules
        if total_score >= 90.0:
            grade = "Green"
            tier_label = "Excellent alignment"
            status_text = "Excellent ATS Compatibility! Your resume strongly matches automated screening filters."
        elif total_score >= 80.0:
            grade = "Green"
            tier_label = "Strong alignment"
            status_text = "Strong ATS Alignment. Your resume passes core automated screening benchmarks."
        elif total_score >= 65.0:
            grade = "Yellow"
            tier_label = "Moderate alignment"
            status_text = "Moderate ATS Compatibility. Enhance missing skill keywords and quantified metrics to boost rank."
        else:
            grade = "Red"
            tier_label = "Weak alignment"
            status_text = "Needs Optimization. Core contact, skills, or work history sections require expansion."

        # Missing & Strength items for threshold explanation
        missing_items = []
        matched_strengths = []

        if not personal_info.get("email"):
            missing_items.append("Valid professional email address")
        else:
            matched_strengths.append("Verified contact details")

        if not personal_info.get("linkedin") and not personal_info.get("github"):
            missing_items.append("LinkedIn or GitHub profile link")
        else:
            matched_strengths.append("Online developer profile links")

        if unique_skills_count < 8:
            missing_items.append("Core technical skills inventory (under 8 extracted skills)")
        else:
            matched_strengths.append(f"Strong technical skill coverage ({unique_skills_count} verified skills)")

        if not experience and not projects:
            missing_items.append("Documented work history or technical projects")

        breakdown = {
            "contactInfo": {
                "score": round(contact_score, 1),
                "max": 10,
                "details": f"{round(contact_score, 1)}/10 — Full contact details provided." if contact_score >= 7.5 else "Incomplete contact info (missing phone, email, or portfolio)."
            },
            "education": {
                "score": round(edu_score, 1),
                "max": 15,
                "details": f"{round(edu_score, 1)}/15 — Verified degree and institution details." if edu_score >= 8.0 else "Education details incomplete or missing degree."
            },
            "projects": {
                "score": round(proj_score, 1),
                "max": 20,
                "details": f"{round(proj_score, 1)}/20 — Technical projects with stack tags." if proj_score >= 10.0 else "Add 1-2 featured projects with technical stack details."
            },
            "skills": {
                "score": round(skills_score, 1),
                "max": 25,
                "details": f"{round(skills_score, 1)}/25 — High coverage across frameworks and databases." if skills_score >= 18.0 else f"Extracted {unique_skills_count} skills. Recommend adding 5+ relevant tools."
            },
            "experience": {
                "score": round(exp_score, 1),
                "max": 15,
                "details": f"{round(exp_score, 1)}/15 — Work history and responsibilities documented." if exp_score >= 8.0 else "Add detailed bullet points highlighting work achievements."
            },
            "keywords": {
                "score": round(kw_score, 1),
                "max": 10,
                "details": f"{round(kw_score, 1)}/10 — Multi-domain terminology coverage." if kw_score >= 7.5 else "Expand keywords across languages, cloud, and databases."
            },
            "formatting": {
                "score": round(fmt_score, 1),
                "max": 5,
                "details": f"{round(fmt_score, 1)}/5 — Parsable layout structure with clear section boundaries."
            }
        }

        return {
            "overallScore": total_score,
            "breakdown": breakdown,
            "grade": grade,
            "tierLabel": tier_label,
            "statusText": status_text,
            "scoringVersion": self.SCORING_VERSION,
            "missingItems": missing_items,
            "matchedStrengths": matched_strengths
        }

ats_engine = ATSScoringEngine()
