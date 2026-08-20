"""
SwipeX Multi-Layer Evidence-Based Job Matching Engine.
Matches candidate skills and experience against job descriptions without false positives.
"""

import re
from typing import Dict, List, Set, Any, Optional, Tuple
from app.ai.taxonomy import normalize_skill, extract_skills_from_text, SKILL_ALIASES

class JobMatcherEngine:
    """
    Multi-layer skill and job requirement matching engine.
    """

    def match(
        self,
        parsed_data: Dict[str, Any],
        job_title: str = "",
        job_description: str = "",
        required_skills: Optional[List[str]] = None,
        preferred_skills: Optional[List[str]] = None,
        company_name: str = ""
    ) -> Dict[str, Any]:
        # 1. Collect candidate's normalized skills
        user_skills_dict = parsed_data.get("skills", {})
        user_skills_set: Set[str] = set()
        user_skills_lower_map: Dict[str, str] = {}

        for cat, sk_list in user_skills_dict.items():
            for s in sk_list:
                norm = normalize_skill(s) or s
                user_skills_set.add(norm)
                user_skills_lower_map[norm.lower()] = norm

        # Also check project technologies and experience descriptions
        for proj in parsed_data.get("projects", []):
            for t in proj.get("technologies", []):
                norm = normalize_skill(t) or t
                user_skills_set.add(norm)
                user_skills_lower_map[norm.lower()] = norm

        # 2. Extract and normalize target job requirements
        target_required: List[str] = []
        target_preferred: List[str] = []

        if required_skills:
            for s in required_skills:
                norm = normalize_skill(s) or s
                if norm not in target_required:
                    target_required.append(norm)

        if preferred_skills:
            for s in preferred_skills:
                norm = normalize_skill(s) or s
                if norm not in target_preferred and norm not in target_required:
                    target_preferred.append(norm)

        # If job description provided, extract canonical skills from it
        if job_description:
            jd_extracted = extract_skills_from_text(job_description)
            for cat, items in jd_extracted.items():
                for it in items:
                    canonical = it[0]
                    if canonical not in target_required and canonical not in target_preferred:
                        # Categorize as required or preferred based on context
                        target_required.append(canonical)

        # Fallback if target skills empty
        if not target_required and not target_preferred:
            target_required = ["TypeScript", "React", "Node.js", "PostgreSQL", "RESTful APIs"]
            target_preferred = ["Docker", "Amazon Web Services (AWS)", "Redis", "GraphQL"]

        # 3. Perform Boundary-Safe Multi-Layer Matching
        satisfied_required: List[str] = []
        missing_required: List[str] = []

        for req in target_required:
            is_matched, match_type = self._is_skill_matched(req, user_skills_set, user_skills_lower_map)
            if is_matched:
                satisfied_required.append(req)
            else:
                missing_required.append(req)

        satisfied_preferred: List[str] = []
        missing_preferred: List[str] = []

        for pref in target_preferred:
            is_matched, _ = self._is_skill_matched(pref, user_skills_set, user_skills_lower_map)
            if is_matched:
                satisfied_preferred.append(pref)
            else:
                missing_preferred.append(pref)

        # 4. Calculate Weighted Match Score
        # Must-Have requirements carry 70% weight, Preferred carry 30% weight
        total_req_count = len(target_required)
        total_pref_count = len(target_preferred)

        req_score = (len(satisfied_required) / total_req_count) if total_req_count > 0 else 1.0
        pref_score = (len(satisfied_preferred) / total_pref_count) if total_pref_count > 0 else 1.0

        if total_pref_count > 0:
            raw_match = (req_score * 0.70 + pref_score * 0.30) * 100.0
        else:
            raw_match = req_score * 100.0

        # Adjust for education / projects evidence
        has_edu = bool(parsed_data.get("education"))
        has_exp = bool(parsed_data.get("experience")) or bool(parsed_data.get("projects"))
        
        bonus = (3.0 if has_edu else 0.0) + (4.0 if has_exp else 0.0)
        final_match_pct = round(min(100.0, max(0.0, raw_match + (bonus if raw_match > 30 else 0.0))), 1)

        satisfied_all = satisfied_required + satisfied_preferred
        missing_all = missing_required + missing_preferred

        # Grounded Recommendation Reason
        display_title = job_title or "Target Position"
        if satisfied_required:
            top_satisfied = satisfied_required[:3]
            reason = f"Your profile satisfies {len(satisfied_required)} of {total_req_count} core requirements for {display_title} (including {', '.join(top_satisfied)})."
        else:
            reason = f"Your profile matches few core requirements for {display_title}. Focus on acquiring {', '.join(missing_required[:2]) if missing_required else 'required skills'}."

        # Skill Gap Analysis
        priority_skills = missing_required[:3] if missing_required else missing_preferred[:2]
        optional_skills = missing_preferred if missing_required else missing_preferred[2:]
        gap_progress = round((len(satisfied_all) / max(1, (len(satisfied_all) + len(missing_all)))) * 100.0, 1)

        skill_gap = {
            "matchPercentage": final_match_pct,
            "alreadyKnown": satisfied_all,
            "needToLearn": missing_all,
            "prioritySkills": priority_skills,
            "optionalSkills": optional_skills,
            "gapProgress": gap_progress
        }

        match_result = {
            "jobId": "",
            "jobTitle": display_title,
            "companyName": company_name or "Hiring Organization",
            "matchPercentage": final_match_pct,
            "satisfiedSkills": satisfied_all,
            "missingSkills": missing_all,
            "educationMatch": has_edu,
            "experienceMatch": has_exp,
            "matchingKeywords": satisfied_all,
            "recommendationReason": reason
        }

        return {
            "matchResult": match_result,
            "skillGap": skill_gap
        }

    def _is_skill_matched(self, target_skill: str, user_skills: Set[str], user_lower_map: Dict[str, str]) -> Tuple[bool, str]:
        """
        Determines if a target skill is matched with exact normalization or alias checks.
        Prevents substring false positives.
        """
        # Exact canonical match
        if target_skill in user_skills:
            return True, "exact"

        t_lower = target_skill.lower().strip()
        if t_lower in user_lower_map:
            return True, "exact_case_insensitive"

        # Normalized alias match
        norm_target = normalize_skill(target_skill)
        if norm_target and norm_target in user_skills:
            return True, "alias"

        # Check aliases dictionary mapping
        for alias, canonical in SKILL_ALIASES.items():
            if canonical == norm_target or canonical == target_skill:
                if alias in user_lower_map or canonical in user_skills:
                    return True, "alias"

        return False, "none"

job_matcher_engine = JobMatcherEngine()
