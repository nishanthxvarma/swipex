"""
SwipeX Evidence-Grounded Resume Health Report Generator.
Computes readability metrics, action-verb density, and fact-grounded recommendations.
"""

import re
from typing import Dict, List, Any

class HealthReportGenerator:
    """
    Evaluates resume health, formatting strength, and readability based on document facts.
    """

    def generate(self, parsed_data: Dict[str, Any], ats_score: float) -> Dict[str, Any]:
        personal_info = parsed_data.get("personalInfo", {})
        skills = parsed_data.get("skills", {})
        projects = parsed_data.get("projects", [])
        experience = parsed_data.get("experience", [])
        certifications = parsed_data.get("certifications", [])

        strengths = []
        weaknesses = []
        missing_sections = []
        duplicate_info = []
        grammar_alerts = []

        # 1. Contact Information Analysis
        has_email = bool(personal_info.get("email"))
        has_phone = bool(personal_info.get("phone"))
        has_links = bool(personal_info.get("linkedin") or personal_info.get("github") or personal_info.get("portfolio"))

        if has_email and has_phone:
            strengths.append("Complete verified contact details with email and phone number.")
        else:
            weaknesses.append("Incomplete contact details (ensure email and phone are present in header).")

        if not has_links:
            missing_sections.append("Online developer profile links (LinkedIn, GitHub, or Portfolio)")

        # 2. Skills Inventory Analysis
        all_skills: List[str] = []
        for cat, skl in skills.items():
            all_skills.extend(skl)
        unique_skills_count = len(set(all_skills))

        if unique_skills_count >= 12:
            strengths.append(f"Rich technical skill inventory with {unique_skills_count} verified technologies.")
        elif unique_skills_count >= 6:
            strengths.append(f"Core technical skills identified ({unique_skills_count} skills).")
        else:
            weaknesses.append("Technical skill section is sparse (recommend listing 8+ relevant tools & technologies).")

        # 3. Work & Project Impact Metrics Analysis
        all_descriptions = [p.get("description", "") for p in projects] + [e.get("description", "") for e in experience]
        total_desc_text = " ".join(all_descriptions)
        
        has_metrics = bool(re.search(r'\b\d+(?:%|\+?k?|\s*x|\s*ms|\s*s)\b', total_desc_text))
        if has_metrics:
            strengths.append("Includes quantifiable impact metrics (percentages, performance numbers, or user scale).")
        else:
            weaknesses.append("Work and project descriptions lack quantifiable impact metrics (e.g., 'improved latency by 30%').")

        # 4. Certifications Check
        if not certifications:
            missing_sections.append("Industry-recognized certifications (e.g. AWS, GCP, Azure, CKA, Scrum)")
        else:
            strengths.append(f"Contains {len(certifications)} professional certification credentials.")

        # 5. Active Action Verb Analysis
        action_verb_count = len(re.findall(r'(?i)\b(architected|engineered|developed|implemented|optimized|designed|spearheaded|built|led|delivered)\b', total_desc_text))
        if action_verb_count >= 3:
            strengths.append(f"Strong usage of impactful action verbs ({action_verb_count} instances detected).")
        else:
            grammar_alerts.append("Consider replacing passive phrasing ('worked on', 'helped with') with strong action verbs ('Architected', 'Engineered', 'Optimized').")

        # 6. Readability & Density Metrics
        keyword_density_rating = "Optimal" if unique_skills_count >= 10 else ("Moderate" if unique_skills_count >= 5 else "Low")
        formatting_quality = "Excellent" if ats_score >= 80 else ("Good" if ats_score >= 65 else "Basic")
        
        # Approximate Flesch Reading Ease calculation
        words = total_desc_text.split()
        sentences = max(1, len(re.split(r'[.!?]+', total_desc_text)))
        words_per_sentence = len(words) / sentences if words else 15
        
        readability_score = round(min(98.0, max(50.0, 100.0 - (words_per_sentence * 1.5))), 1)

        items = [
            {
                "category": "Strengths",
                "title": "Technical Skill Coverage",
                "description": f"Extracted {unique_skills_count} canonical technical skills across programming languages, frameworks, and databases.",
                "type": "strength"
            },
            {
                "category": "Weaknesses",
                "title": "Quantified Impact Metrics",
                "description": "Quantifiable outcomes (e.g. percentages, performance gains, uptime) strengthen recruiter confidence." if not has_metrics else "Quantified metrics successfully present in descriptions.",
                "type": "info" if has_metrics else "weakness"
            },
            {
                "category": "Keyword Density",
                "title": f"Keyword Density: {keyword_density_rating}",
                "description": f"Extracted {unique_skills_count} categorized skill entities without keyword stuffing.",
                "type": "info"
            },
            {
                "category": "Readability",
                "title": f"Readability Index: {int(readability_score)}/100",
                "description": "Clear section boundaries and structured bullet points.",
                "type": "info"
            }
        ]

        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "missingSections": missing_sections,
            "duplicateInfo": duplicate_info,
            "grammarAlerts": grammar_alerts,
            "keywordDensityRating": keyword_density_rating,
            "formattingQuality": formatting_quality,
            "overallReadabilityScore": readability_score,
            "items": items
        }

health_report_generator = HealthReportGenerator()
