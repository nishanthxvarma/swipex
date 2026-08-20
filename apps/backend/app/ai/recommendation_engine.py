"""
SwipeX AI Job Recommendation Engine.
Matches candidates against active database job listings or realistic market roles using grounded skill overlap.
"""

from typing import Dict, List, Any, Optional
from app.ai.job_matcher import job_matcher_engine
from app.ai.taxonomy import normalize_skill

class AIJobRecommendationEngine:
    """
    Evaluates and ranks job opportunities against candidate resume data.
    """

    def recommend(self, parsed_data: Dict[str, Any], available_jobs: Optional[List[Any]] = None) -> List[Dict[str, Any]]:
        # If actual database jobs are provided
        if available_jobs:
            recommendations = []
            for j in available_jobs:
                req_skills = j.skills_required if hasattr(j, "skills_required") and isinstance(j.skills_required, list) else []
                pref_skills = j.skills_preferred if hasattr(j, "skills_preferred") and isinstance(j.skills_preferred, list) else []
                comp_name = j.company.name if hasattr(j, "company") and j.company else "Tech Organization"
                
                match_res = job_matcher_engine.match(
                    parsed_data=parsed_data,
                    job_title=getattr(j, "title", "Software Engineer"),
                    job_description=getattr(j, "description", "") or "",
                    required_skills=req_skills,
                    preferred_skills=pref_skills,
                    company_name=comp_name
                )
                
                score = match_res["matchResult"]["matchPercentage"]
                tier = "Top Match" if score >= 85 else ("Good Match" if score >= 70 else "Stretch Match")
                
                salary_str = f"${int(getattr(j, 'salary_min', 120000)):,} - ${int(getattr(j, 'salary_max', 180000)):,}" if getattr(j, "salary_min", None) else "$130,000 - $175,000"

                recommendations.append({
                    "id": str(getattr(j, "id", "job_1")),
                    "jobTitle": getattr(j, "title", "Software Engineer"),
                    "companyName": comp_name,
                    "location": getattr(j, "location", "Remote"),
                    "salary": salary_str,
                    "matchPercentage": score,
                    "tier": tier,
                    "reason": match_res["matchResult"]["recommendationReason"],
                    "matchingSkills": match_res["matchResult"]["satisfiedSkills"][:4],
                    "missingSkills": match_res["matchResult"]["missingSkills"][:3],
                    "expectedAtsScore": float(min(100.0, score + 2.0))
                })

            # Sort descending by match percentage
            recommendations.sort(key=lambda x: x["matchPercentage"], reverse=True)
            return recommendations

        # Benchmark job archetypes dynamically evaluated against candidate's actual extracted skills
        archetypes = [
            {
                "id": "job_rec_1",
                "jobTitle": "Senior Frontend Engineer (React / Next.js)",
                "companyName": "Vercel",
                "location": "Remote (US/Global)",
                "salary": "$160,000 - $210,000",
                "reqSkills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js"],
                "prefSkills": ["GraphQL", "Vite", "Jest"]
            },
            {
                "id": "job_rec_2",
                "jobTitle": "Full Stack Software Architect",
                "companyName": "Stripe",
                "location": "San Francisco, CA (Hybrid)",
                "salary": "$175,000 - $230,000",
                "reqSkills": ["TypeScript", "Python", "FastAPI", "PostgreSQL", "Redis"],
                "prefSkills": ["Docker", "Amazon Web Services (AWS)", "Kafka"]
            },
            {
                "id": "job_rec_3",
                "jobTitle": "Lead UI Systems Engineer",
                "companyName": "Figma",
                "location": "Remote",
                "salary": "$155,000 - $195,000",
                "reqSkills": ["React", "TypeScript", "CSS3", "Framer Motion"],
                "prefSkills": ["GraphQL", "WebSockets", "Storybook"]
            },
            {
                "id": "job_rec_4",
                "jobTitle": "Cloud Native Backend Developer",
                "companyName": "Datadog",
                "location": "New York, NY",
                "salary": "$150,000 - $190,000",
                "reqSkills": ["Go", "Kubernetes", "Amazon Web Services (AWS)", "Docker", "PostgreSQL"],
                "prefSkills": ["Prometheus", "Kafka", "gRPC"]
            }
        ]

        results = []
        for arch in archetypes:
            match_res = job_matcher_engine.match(
                parsed_data=parsed_data,
                job_title=arch["jobTitle"],
                required_skills=arch["reqSkills"],
                preferred_skills=arch["prefSkills"],
                company_name=arch["companyName"]
            )
            score = match_res["matchResult"]["matchPercentage"]
            tier = "Top Match" if score >= 80 else ("Good Match" if score >= 65 else "Stretch Match")

            results.append({
                "id": arch["id"],
                "jobTitle": arch["jobTitle"],
                "companyName": arch["companyName"],
                "location": arch["location"],
                "salary": arch["salary"],
                "matchPercentage": score,
                "tier": tier,
                "reason": match_res["matchResult"]["recommendationReason"],
                "matchingSkills": match_res["matchResult"]["satisfiedSkills"],
                "missingSkills": match_res["matchResult"]["missingSkills"],
                "expectedAtsScore": float(min(100.0, round(score + 2.0, 1)))
            })

        results.sort(key=lambda x: x["matchPercentage"], reverse=True)
        return results

ai_recommendation_engine = AIJobRecommendationEngine()
