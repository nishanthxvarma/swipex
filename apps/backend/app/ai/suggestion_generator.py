"""
SwipeX Fact-Grounded AI Resume Suggestion Engine.
Produces actionable, evidence-based suggestions without inventing fake metrics or achievements.
"""

import uuid
import re
from typing import Dict, List, Any

class SuggestionGenerator:
    """
    Generates grounded improvements for candidate resumes.
    Strictly forbids fabricating numbers or hallucinated claims.
    """

    def generate(self, parsed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        projects = parsed_data.get("projects", [])
        experience = parsed_data.get("experience", [])
        personal_info = parsed_data.get("personalInfo", {})
        skills = parsed_data.get("skills", {})

        suggestions = []

        # 1. Project bullet point metric enhancement (WITHOUT fabricating numbers)
        if projects:
            p1 = projects[0]
            curr_desc = p1.get("description", "")
            if curr_desc and not re.search(r'\b\d+(?:%|\+?k?|\s*x)\b', curr_desc):
                suggestions.append({
                    "id": str(uuid.uuid4()),
                    "category": "Impact Metrics",
                    "problem": f"Project '{p1.get('title', 'Featured Project')}' description lacks quantitative results.",
                    "reason": "ATS screeners and hiring managers prioritize bullet points with measurable impact (percentages, performance gains, scale).",
                    "current": curr_desc[:100] + "..." if len(curr_desc) > 100 else curr_desc,
                    "suggested": f"{curr_desc.rstrip('.')} [add a truthful metric if available, e.g., 'reducing latency by X%' or 'serving Y active users'].",
                    "impactScore": 15.0
                })

        # 2. Experience bullet point action verbs & metrics
        if experience:
            e1 = experience[0]
            curr_desc = e1.get("description", "")
            if curr_desc and not re.search(r'\b\d+(?:%|\+?k?|\s*x)\b', curr_desc):
                suggestions.append({
                    "id": str(uuid.uuid4()),
                    "category": "Experience Impact",
                    "problem": f"Role '{e1.get('role', 'Experience')}' at {e1.get('company', 'Company')} lacks measurable outcomes.",
                    "reason": "Demonstrating specific business outcomes differentiates senior candidates from general applicants.",
                    "current": curr_desc[:100] + "..." if len(curr_desc) > 100 else curr_desc,
                    "suggested": f"{curr_desc.rstrip('.')} resulting in [insert truthful quantifiable achievement or percentage improvement].",
                    "impactScore": 14.0
                })

        # 3. Online profile links
        has_gh = bool(personal_info.get("github"))
        has_li = bool(personal_info.get("linkedin"))
        has_port = bool(personal_info.get("portfolio"))

        if not has_gh or not has_li:
            missing_links = []
            if not has_li:
                missing_links.append("LinkedIn profile")
            if not has_gh:
                missing_links.append("GitHub repository")
            
            suggestions.append({
                "id": str(uuid.uuid4()),
                "category": "Online Profiles",
                "problem": f"Missing {', '.join(missing_links)} in header.",
                "reason": "Technical recruiters and hiring managers verify portfolio and open-source contributions directly from profile URLs.",
                "current": f"Contact: {personal_info.get('email', 'Email provided')}",
                "suggested": f"Add your verified {', '.join(missing_links)} link to the top contact section.",
                "impactScore": 10.0
            })

        # 4. Cloud / Infrastructure Breadth
        cloud_skills = skills.get("cloud", [])
        if len(cloud_skills) == 0:
            suggestions.append({
                "id": str(uuid.uuid4()),
                "category": "Cloud & Infrastructure",
                "problem": "No cloud platform or containerization skills explicitly listed.",
                "reason": "Modern engineering roles frequently screen for cloud deployment and containerization keywords.",
                "current": "Cloud: None listed",
                "suggested": "Consider listing cloud platforms (e.g. AWS, GCP, Azure) or Docker/Kubernetes only if you have real hands-on experience.",
                "impactScore": 12.0
            })

        # 5. Certifications
        if not parsed_data.get("certifications"):
            suggestions.append({
                "id": str(uuid.uuid4()),
                "category": "Certifications",
                "problem": "No industry certifications listed.",
                "reason": "Certifications validate domain expertise under automated ATS educational filters.",
                "current": "Certifications: None listed",
                "suggested": "If you hold relevant certifications (e.g., AWS Certified, CKA, Scrum Master), add a dedicated 'Certifications' section.",
                "impactScore": 8.0
            })

        return suggestions

suggestion_generator = SuggestionGenerator()
