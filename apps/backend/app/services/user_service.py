from app.repositories.user_repository import UserRepository
import uuid

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
    
    async def get_profile(self, user_id):
        return await self.user_repo.get_profile(user_id)
    
    async def update_profile(self, user_id, profile_data):
        profile = await self.user_repo.get_profile(user_id)
        if not profile:
            from app.models.user import ProfileModel
            uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
            profile = ProfileModel(user_id=uid)
            self.user_repo.db.add(profile)

        if hasattr(profile_data, "model_dump"):
            data = profile_data.model_dump(exclude_unset=True)
        elif isinstance(profile_data, dict):
            data = profile_data
        else:
            data = {}

        field_map = {
            "fullName": "full_name",
            "about": "bio",
            "experienceYears": "experience_years",
            "socialLinks": "social_links",
            "githubUrl": "github_url",
            "linkedinUrl": "linkedin_url",
            "portfolioUrl": "portfolio_url",
            "profileCompletion": "profile_completion"
        }

        for k, v in data.items():
            db_field = field_map.get(k, k)
            if hasattr(profile, db_field) and v is not None:
                setattr(profile, db_field, v)

        # Dynamic profile completion % calculation
        filled_count = 0
        total_fields = 7
        if profile.full_name: filled_count += 1
        if profile.headline: filled_count += 1
        if profile.bio: filled_count += 1
        if profile.location: filled_count += 1
        if profile.skills and len(profile.skills) > 0: filled_count += 1
        if (profile.experiences and len(profile.experiences) > 0) or profile.experience_years: filled_count += 1
        if profile.github_url or profile.linkedin_url or profile.portfolio_url or (profile.social_links and len(profile.social_links) > 0): filled_count += 1

        completion_pct = max(10, int((filled_count / total_fields) * 100))
        profile.profile_completion = f"{completion_pct}%"

        return await self.user_repo.update_profile(profile)
    
    async def get_dashboard_stats(self, user_id):
        return {"stats": {}}

    async def get_candidates(self):
        return await self.user_repo.get_candidates()

    async def record_candidate_action(self, recruiter_id, candidate_id, action_type, job_id=None, notes=None):
        from app.models.application import RecruiterCandidateActionModel, CandidateActionType
        r_id = uuid.UUID(recruiter_id) if isinstance(recruiter_id, str) else recruiter_id
        c_id = uuid.UUID(candidate_id) if isinstance(candidate_id, str) else candidate_id
        j_id = uuid.UUID(job_id) if (job_id and isinstance(job_id, str)) else job_id

        existing = await self.user_repo.get_candidate_action(r_id, c_id)
        if existing:
            existing.action = CandidateActionType(action_type)
            if j_id:
                existing.job_id = j_id
            if notes:
                existing.notes = notes
            self.user_repo.db.add(existing)
            await self.user_repo.db.commit()
            await self.user_repo.db.refresh(existing)
            return existing

        action_record = RecruiterCandidateActionModel(
            recruiter_id=r_id,
            candidate_id=c_id,
            job_id=j_id,
            action=CandidateActionType(action_type),
            notes=notes
        )
        return await self.user_repo.save_candidate_action(action_record)
