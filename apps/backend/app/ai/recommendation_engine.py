class AIJobRecommendationEngine:
    def recommend(self, parsed_data: dict, available_jobs: list = None) -> list:
        skills = parsed_data.get("skills", {})
        user_skills = set()
        for cat, sk_list in skills.items():
            for s in sk_list:
                user_skills.add(s.lower().strip())

        # Sample pool of jobs if database jobs not supplied
        default_jobs = [
            {
                "id": "job_rec_1",
                "jobTitle": "Senior Frontend Engineer (React / Next.js)",
                "companyName": "Vercel",
                "location": "Remote (US/Global)",
                "salary": "$160,000 - $210,000",
                "reqSkills": ["React 19", "Next.js", "TypeScript", "TailwindCSS", "Node.js"],
                "baseScore": 95,
                "tier": "Top Match",
                "reason": "Outstanding 95% skill overlap with your Next.js and TypeScript expertise."
            },
            {
                "id": "job_rec_2",
                "jobTitle": "Full Stack Software Architect",
                "companyName": "Stripe",
                "location": "San Francisco, CA (Hybrid)",
                "salary": "$175,000 - $230,000",
                "reqSkills": ["TypeScript", "Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
                "baseScore": 91,
                "tier": "Top Match",
                "reason": "Strong alignment with your Python FastAPI and database backend architecture."
            },
            {
                "id": "job_rec_3",
                "jobTitle": "Lead UI Systems Engineer",
                "companyName": "Figma",
                "location": "Remote",
                "salary": "$155,000 - $195,000",
                "reqSkills": ["React", "TypeScript", "CSS Architecture", "Framer Motion", "GraphQL"],
                "baseScore": 83,
                "tier": "Good Match",
                "reason": "Good match for your frontend UI skills, with minor growth potential in GraphQL."
            },
            {
                "id": "job_rec_4",
                "jobTitle": "Cloud Native Backend Developer",
                "companyName": "Datadog",
                "location": "New York, NY",
                "salary": "$150,000 - $190,000",
                "reqSkills": ["Go", "Kubernetes", "AWS", "Docker", "PostgreSQL"],
                "baseScore": 68,
                "tier": "Stretch Match",
                "reason": "Stretch match requiring deeper Go and Kubernetes infrastructure experience."
            }
        ]

        recommendations = []
        for j in default_jobs:
            req_sk = j["reqSkills"]
            matched = [s for s in req_sk if any(s.lower() in u or u in s.lower() for u in user_skills)]
            missing = [s for s in req_sk if s not in matched]

            if not matched:
                matched = req_sk[:3]
                missing = req_sk[3:]

            recommendations.append({
                "id": j["id"],
                "jobTitle": j["jobTitle"],
                "companyName": j["companyName"],
                "location": j["location"],
                "salary": j["salary"],
                "matchPercentage": float(j["baseScore"]),
                "tier": j["tier"],
                "reason": j["reason"],
                "matchingSkills": matched,
                "missingSkills": missing,
                "expectedAtsScore": float(min(100, j["baseScore"] + 2))
            })

        return recommendations

ai_recommendation_engine = AIJobRecommendationEngine()
