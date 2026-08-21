from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.models.application import ApplicationModel, SavedJobModel, SwipeModel, ApplicationStatus, SwipeDirection
from app.models.job import JobModel, CompanyModel
from app.models.resume import ResumeModel
from app.models.user import UserModel, ProfileModel
from datetime import datetime, timedelta, timezone
import uuid

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _get_start_date(self, time_range: str) -> datetime:
        now = datetime.now(timezone.utc)
        if time_range == '7d':
            return now - timedelta(days=7)
        elif time_range == '90d':
            return now - timedelta(days=90)
        elif time_range == 'all':
            return datetime(2020, 1, 1, tzinfo=timezone.utc)
        else:  # default 30d
            return now - timedelta(days=30)

    async def get_candidate_analytics(self, user_id: uuid.UUID, time_range: str = '30d') -> dict:
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)
        start_date = self._get_start_date(time_range)

        # 1. Latest Resume Score
        res_stmt = select(ResumeModel).where(ResumeModel.user_id == user_id).order_by(ResumeModel.created_at.desc())
        res_res = await self.db.execute(res_stmt)
        latest_resume = res_res.scalars().first()
        career_score = round(latest_resume.ats_score, 1) if (latest_resume and latest_resume.ats_score is not None) else 0.0

        # 2. Profile completion %
        prof_stmt = select(ProfileModel).where(ProfileModel.user_id == user_id)
        prof_res = await self.db.execute(prof_stmt)
        profile = prof_res.scalars().first()
        profile_completion = float(profile.profile_completion.replace('%', '')) if (profile and profile.profile_completion) else 0.0

        # 3. Swipes (views, likes, passes)
        swipes_stmt = select(SwipeModel).where(and_(SwipeModel.user_id == user_id, SwipeModel.created_at >= start_date))
        swipes_res = await self.db.execute(swipes_stmt)
        swipes = swipes_res.scalars().all()
        
        total_viewed = len(swipes)
        jobs_liked = sum(1 for s in swipes if s.direction in (SwipeDirection.right, SwipeDirection.up))
        jobs_rejected = sum(1 for s in swipes if s.direction == SwipeDirection.left)

        # 4. Saved jobs
        saved_stmt = select(func.count(SavedJobModel.id)).where(and_(SavedJobModel.user_id == user_id, SavedJobModel.saved_at >= start_date))
        saved_res = await self.db.execute(saved_stmt)
        jobs_saved = saved_res.scalar_one()

        # 5. Applications
        apps_stmt = select(ApplicationModel).where(and_(ApplicationModel.user_id == user_id, ApplicationModel.applied_at >= start_date))
        apps_res = await self.db.execute(apps_stmt)
        applications = apps_res.scalars().all()

        applications_submitted = len(applications)
        interviews_count = sum(1 for a in applications if a.status == ApplicationStatus.interview)
        offers_count = sum(1 for a in applications if a.status == ApplicationStatus.offer)
        viewed_apps_count = sum(1 for a in applications if a.status in (ApplicationStatus.reviewing, ApplicationStatus.shortlisted, ApplicationStatus.interview, ApplicationStatus.offer, ApplicationStatus.hired, ApplicationStatus.rejected))
        shortlisted_count = sum(1 for a in applications if a.status in (ApplicationStatus.shortlisted, ApplicationStatus.interview, ApplicationStatus.offer, ApplicationStatus.hired))

        app_success_rate = round((offers_count / applications_submitted * 100), 1) if applications_submitted > 0 else 0.0

        # 6. Timeline data
        days_span = 7 if time_range == '7d' else 30
        step_days = max(1, days_span // 7)
        timeline = []
        for i in range(6, -1, -1):
            dt = datetime.now(timezone.utc) - timedelta(days=i * step_days)
            date_str = dt.strftime("%b %d")
            day_apps = sum(1 for a in applications if a.applied_at and a.applied_at.date() == dt.date())
            day_views = sum(1 for s in swipes if s.created_at and s.created_at.date() == dt.date())
            timeline.append({"date": date_str, "viewed": day_views, "applied": day_apps})

        # 7. Funnel Steps (strict conversion without fake baseline inflating)
        funnel = [
            {"stage": "Jobs Viewed", "count": total_viewed, "conversionPct": 100.0 if total_viewed > 0 else 0.0},
            {"stage": "Jobs Liked", "count": jobs_liked, "conversionPct": round((jobs_liked / total_viewed) * 100, 1) if total_viewed > 0 else 0.0},
            {"stage": "Jobs Applied", "count": applications_submitted, "conversionPct": round((applications_submitted / jobs_liked) * 100, 1) if jobs_liked > 0 else 0.0},
            {"stage": "Applications Viewed", "count": viewed_apps_count, "conversionPct": round((viewed_apps_count / applications_submitted) * 100, 1) if applications_submitted > 0 else 0.0},
            {"stage": "Shortlisted", "count": shortlisted_count, "conversionPct": round((shortlisted_count / viewed_apps_count) * 100, 1) if viewed_apps_count > 0 else 0.0},
            {"stage": "Interviews", "count": interviews_count, "conversionPct": round((interviews_count / shortlisted_count) * 100, 1) if shortlisted_count > 0 else 0.0},
            {"stage": "Offers", "count": offers_count, "conversionPct": round((offers_count / interviews_count) * 100, 1) if interviews_count > 0 else 0.0},
        ]

        # Top skills extracted from candidate profile
        top_skills = []
        if profile and profile.skills:
            top_skills = [{"skill": s, "count": 1} for s in profile.skills[:5]]

        location_prefs = [
            {"locationType": "Remote", "percentage": 100.0 if (profile and profile.location and "remote" in profile.location.lower()) else 0.0}
        ]

        return {
            "careerScore": career_score,
            "profileCompletionPct": profile_completion,
            "totalJobsViewed": total_viewed,
            "jobsLiked": jobs_liked,
            "jobsRejected": jobs_rejected,
            "jobsSaved": jobs_saved,
            "applicationsSubmitted": applications_submitted,
            "interviewsCount": interviews_count,
            "offersCount": offers_count,
            "applicationSuccessRatePct": app_success_rate,
            "timeRange": time_range,
            "activityTimeline": timeline,
            "funnel": funnel,
            "topSkillsRequired": top_skills,
            "locationPreferences": location_prefs,
        }

    async def get_recruiter_analytics(self, user_id: uuid.UUID, time_range: str = '30d') -> dict:
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)
        start_date = self._get_start_date(time_range)

        # Active jobs
        jobs_stmt = select(JobModel).where(JobModel.is_active == True)
        jobs_res = await self.db.execute(jobs_stmt)
        jobs = jobs_res.scalars().all()
        active_jobs_count = len(jobs)

        # Applications received
        apps_stmt = select(ApplicationModel).where(ApplicationModel.applied_at >= start_date)
        apps_res = await self.db.execute(apps_stmt)
        applications = apps_res.scalars().all()

        apps_received = len(applications)
        apps_reviewed = sum(1 for a in applications if a.status != ApplicationStatus.applied)
        shortlisted = sum(1 for a in applications if a.status in (ApplicationStatus.shortlisted, ApplicationStatus.interview, ApplicationStatus.offer, ApplicationStatus.hired))
        interviews = sum(1 for a in applications if a.status == ApplicationStatus.interview)
        offers = sum(1 for a in applications if a.status == ApplicationStatus.offer)
        hired = sum(1 for a in applications if a.status == ApplicationStatus.hired)
        rejected = sum(1 for a in applications if a.status == ApplicationStatus.rejected)

        conversion_pct = round((hired / apps_received) * 100, 1) if apps_received > 0 else 0.0

        scores = [a.ats_score for a in applications if a.ats_score is not None]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        pipeline_dist = [
            {"stage": "Applied", "count": sum(1 for a in applications if a.status == ApplicationStatus.applied)},
            {"stage": "Reviewing", "count": sum(1 for a in applications if a.status == ApplicationStatus.reviewing)},
            {"stage": "Shortlisted", "count": sum(1 for a in applications if a.status == ApplicationStatus.shortlisted)},
            {"stage": "Interview", "count": interviews},
            {"stage": "Offer", "count": offers},
            {"stage": "Hired", "count": hired},
            {"stage": "Rejected", "count": rejected},
        ]

        return {
            "activeJobsCount": active_jobs_count,
            "applicationsReceivedCount": apps_received,
            "applicationsReviewedCount": apps_reviewed,
            "shortlistedCount": shortlisted,
            "interviewsCount": interviews,
            "hiringConversionPct": conversion_pct,
            "avgApplicantMatchScore": avg_score,
            "pipelineDistribution": pipeline_dist,
            "timeRange": time_range
        }

    async def get_admin_analytics(self) -> dict:
        js_stmt = select(func.count(UserModel.id)).where(UserModel.role == "job_seeker")
        js_res = await self.db.execute(js_stmt)
        total_job_seekers = js_res.scalar_one()

        rec_stmt = select(func.count(UserModel.id)).where(UserModel.role == "recruiter")
        rec_res = await self.db.execute(rec_stmt)
        verified_recruiters = rec_res.scalar_one()

        jobs_stmt = select(func.count(JobModel.id)).where(JobModel.is_active == True)
        jobs_res = await self.db.execute(jobs_stmt)
        active_listings = jobs_res.scalar_one()

        apps_stmt = select(func.count(ApplicationModel.id))
        apps_res = await self.db.execute(apps_stmt)
        total_applications = apps_res.scalar_one()

        return {
            "totalJobSeekers": total_job_seekers,
            "verifiedRecruiters": verified_recruiters,
            "activeJobListings": active_listings,
            "platformApplications": total_applications
        }
