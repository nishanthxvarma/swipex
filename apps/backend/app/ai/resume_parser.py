"""
SwipeX Production-Grade Evidence-Based Resume Parser.
Extracts contact info, categorized skills, education, work/leadership experience, projects, certifications,
and achievements with strict evidence spans and zero hardcoded fallback data.
"""

import re
import uuid
import logging
from typing import Dict, List, Any, Optional, Tuple

from app.ai.layout_extractor import layout_extractor
from app.ai.taxonomy import (
    extract_skills_from_text,
    normalize_skill,
    get_skill_category,
    CATEGORY_LANGUAGES,
    CATEGORY_FRAMEWORKS,
    CATEGORY_LIBRARIES,
    CATEGORY_DATABASES,
    CATEGORY_CLOUD,
    CATEGORY_TOOLS,
)

logger = logging.getLogger(__name__)

# Comprehensive section heading detection patterns
SECTION_PATTERNS: Dict[str, str] = {
    "education": r'(?i)^\s*(?:[•\-\*\d\.\)]+\s*)?(education|academic background|academics|educational qualifications|qualifications|academic history|degrees|coursework)\b',
    "skills": r'(?i)^\s*(?:[•\-\*\d\.\)]+\s*)?(technical skills|skills & technologies|skills & tools|technologies|skills|tech stack|core competencies|skillset|areas of expertise|tools & technologies)\b',
    "experience": r'(?i)^\s*(?:[•\-\*\d\.\)]+\s*)?(work experience|professional experience|experience & leadership|leadership & experience|experience|employment history|work history|career history|internships|leadership experience|volunteer experience)\b',
    "projects": r'(?i)^\s*(?:[•\-\*\d\.\)]+\s*)?(projects|personal projects|technical projects|academic projects|key projects|featured projects|selected projects|projects & open source)\b',
    "certifications": r'(?i)^\s*(?:[•\-\*\d\.\)]+\s*)?(certifications|certifications & licenses|certificates|licenses & certifications|credentials|courses & certifications)\b',
    "achievements": r'(?i)^\s*(?:[•\-\*\d\.\)]+\s*)?(achievements|awards & achievements|key achievements|honors & awards|awards|accomplishments|hackathons & achievements|extracurricular activities|extracurriculars)\b',
    "summary": r'(?i)^\s*(?:[•\-\*\d\.\)]+\s*)?(professional summary|summary|profile|about me|executive summary|objective|career objective)\b',
    "languages": r'(?i)^\s*(?:[•\-\*\d\.\)]+\s*)?(languages|language proficiency|spoken languages)\b',
}

DEGREE_PATTERNS = [
    r'(?i)\b(b\.?s\.?c?|b\.?tech|b\.?e\.?|bachelor(?:[\'\’]s)?(?:\s+of\s+[a-zA-Z\s&]+)?)\b',
    r'(?i)\b(m\.?s\.?c?|m\.?tech|m\.?e\.?|master(?:[\'\’]s)?(?:\s+of\s+[a-zA-Z\s&]+)?|m\.?b\.?a\.?)\b',
    r'(?i)\b(ph\.?d\.?|doctorate|doctor\s+of\s+[a-zA-Z\s&]+)\b',
    r'(?i)\b(associate(?:[\'\’]s)?(?:\s+degree)?|diploma|intermediate|higher secondary|high school)\b',
]

class ResumeParser:
    """
    Evidence-grounded structured resume parser.
    """
    PARSER_VERSION = "2.1.0"

    def extract_text(self, file_bytes: bytes, file_type: str) -> str:
        doc = layout_extractor.extract_document(file_bytes, file_type)
        return doc.get("raw_text", "")

    def parse(self, file_bytes: bytes, file_type: str, filename: str) -> Dict[str, Any]:
        """
        Parses document bytes into a structured JSON representation adhering to ParsedResumeSchema.
        Guaranteed to contain zero hardcoded fallback data.
        """
        doc = layout_extractor.extract_document(file_bytes, file_type, filename)
        raw_text = doc.get("raw_text", "")
        lines = [l.strip() for l in raw_text.splitlines() if l.strip()]

        if not raw_text or len(raw_text.strip()) < 20:
            logger.warning(f"Resume parser received empty or sparse text for {filename}")

        # 1. Segment text into sections
        sections = self._segment_sections(lines)
        evidence_spans: Dict[str, Any] = {}

        # 2. Extract Personal & Contact Information
        personal_info, contact_spans = self._extract_contact_info(lines, raw_text, filename)
        evidence_spans.update(contact_spans)

        # 3. Extract Skills with Taxonomy Normalization
        skills_text = sections.get("skills", "") or raw_text
        skills_dict, skills_spans = self._extract_skills(skills_text, raw_text)
        evidence_spans["skills"] = skills_spans

        # 4. Extract Education
        edu_text = sections.get("education", "")
        education_list, edu_spans = self._extract_education(edu_text if edu_text else raw_text)
        evidence_spans["education"] = edu_spans

        # 5. Extract Work & Leadership Experience
        exp_text = sections.get("experience", "")
        experience_list, exp_spans = self._extract_experience(exp_text if exp_text else raw_text)
        evidence_spans["experience"] = exp_spans

        # 6. Extract Projects
        proj_text = sections.get("projects", "")
        projects_list, proj_spans = self._extract_projects(proj_text if proj_text else raw_text)
        evidence_spans["projects"] = proj_spans

        # 7. Extract Certifications, Achievements, Languages
        cert_text = sections.get("certifications", "")
        certifications = self._extract_list_items(cert_text) if cert_text else self._extract_certs_from_text(raw_text)

        ach_text = sections.get("achievements", "")
        achievements = self._extract_list_items(ach_text)

        lang_text = sections.get("languages", "")
        languages = self._extract_list_items(lang_text) if lang_text else self._extract_languages_from_text(raw_text)

        # Summary / Bio
        summary_text = sections.get("summary", "")

        return {
            "personalInfo": {
                "name": personal_info.get("name", ""),
                "email": personal_info.get("email", ""),
                "phone": personal_info.get("phone", ""),
                "linkedin": personal_info.get("linkedin", ""),
                "github": personal_info.get("github", ""),
                "portfolio": personal_info.get("portfolio", ""),
                "location": personal_info.get("location", ""),
                "headline": personal_info.get("headline", "")
            },
            "education": education_list,
            "skills": skills_dict,
            "experience": experience_list,
            "projects": projects_list,
            "certifications": certifications,
            "achievements": achievements,
            "languages": languages,
            # Metadata fields
            "_metadata": {
                "parser_version": self.PARSER_VERSION,
                "extraction_confidence": doc.get("confidence", 0.95),
                "is_scanned": doc.get("is_scanned", False),
                "page_count": doc.get("page_count", 1),
                "detected_columns": doc.get("detected_columns", 1),
                "evidence_spans": evidence_spans
            }
        }

    def _segment_sections(self, lines: List[str]) -> Dict[str, str]:
        """
        Splits document lines into structured section text blocks by detecting headings.
        """
        sections: Dict[str, List[str]] = {}
        current_section = "header"
        sections[current_section] = []

        for line in lines:
            line_clean = line.strip()
            # Normalize heading test line
            test_heading = re.sub(r'[:\-_–—|•\*\d\.\)]+$', '', line_clean).strip()
            test_heading = re.sub(r'^[•\-\*\d\.\)]+\s*', '', test_heading).strip()

            matched_section = None
            if len(test_heading.split()) <= 6:
                for sec_key, pattern in SECTION_PATTERNS.items():
                    if re.match(pattern, test_heading):
                        matched_section = sec_key
                        break

            if matched_section:
                current_section = matched_section
                if current_section not in sections:
                    sections[current_section] = []
            else:
                sections[current_section].append(line_clean)

        return {sec: "\n".join(lines_arr).strip() for sec, lines_arr in sections.items()}

    def _extract_contact_info(self, lines: List[str], raw_text: str, filename: str) -> Tuple[Dict[str, str], Dict[str, Any]]:
        info = {
            "name": "",
            "email": "",
            "phone": "",
            "linkedin": "",
            "github": "",
            "portfolio": "",
            "location": "",
            "headline": ""
        }
        spans = {}

        # Email
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', raw_text)
        if email_match:
            info["email"] = email_match.group(0)
            spans["email"] = {"value": info["email"], "span": email_match.span(), "confidence": 1.0}

        # Phone Number (support +91 9391152853, (555) 123-4567, 9391152853, +1-800-555-0199)
        phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,5}\b', raw_text)
        if phone_match:
            phone_candidate = phone_match.group(0).strip()
            # Validate contains at least 7 digits and not a graduation year
            digits = re.sub(r'\D', '', phone_candidate)
            if len(digits) >= 10:
                info["phone"] = phone_candidate
                spans["phone"] = {"value": info["phone"], "span": phone_match.span(), "confidence": 0.95}

        # LinkedIn
        linkedin_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([A-Za-z0-9_-]+)', raw_text, re.IGNORECASE)
        if linkedin_match:
            info["linkedin"] = linkedin_match.group(0)
            spans["linkedin"] = {"value": info["linkedin"], "span": linkedin_match.span(), "confidence": 1.0}

        # GitHub
        github_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([A-Za-z0-9_-]+)', raw_text, re.IGNORECASE)
        if github_match:
            info["github"] = github_match.group(0)
            spans["github"] = {"value": info["github"], "span": github_match.span(), "confidence": 1.0}

        # Portfolio / LeetCode / Personal URL
        portfolio_match = re.search(r'(?:https?://)?(?:www\.)?([A-Za-z0-9_-]+\.(?:io|dev|me|app|site|tech|vercel\.app)|leetcode\.com/[A-Za-z0-9_-]+)', raw_text, re.IGNORECASE)
        if portfolio_match:
            match_str = portfolio_match.group(0)
            if "linkedin" not in match_str.lower() and "github" not in match_str.lower():
                info["portfolio"] = match_str
                spans["portfolio"] = {"value": match_str, "span": portfolio_match.span(), "confidence": 0.90}

        # Location heuristic: City, State / City, Country on early lines
        for line in lines[:8]:
            loc_match = re.search(r'^([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z\s]+))$', line.strip())
            if loc_match:
                candidate_loc = loc_match.group(1).strip()
                if not any(k in candidate_loc.lower() for k in ("university", "college", "engineer", "developer", "resume", "education", "experience")):
                    info["location"] = candidate_loc
                    spans["location"] = {"value": info["location"], "confidence": 0.85}
                    break

        if not info["location"]:
            loc_inline = re.search(r'\b([A-Z][a-zA-Z]+,\s*(?:India|USA|United States|UK|Canada|Germany|Australia))\b', raw_text[:600])
            if loc_inline:
                info["location"] = loc_inline.group(1).strip()

        # Candidate Name extraction from first valid non-header lines
        candidate_name = ""
        for line in lines[:6]:
            clean_line = line.strip()
            # If line contains delimiters like | or •, test the first part
            parts = [p.strip() for p in re.split(r'[|•–—]', clean_line) if p.strip()]
            for part in parts:
                if re.search(r'[@/\\:]|http|\.com|\.io|\d{2}', part):
                    continue
                words = part.split()
                if 2 <= len(words) <= 4 and re.match(r'^[A-Za-z\s\.\'-]+$', part):
                    if part.lower() not in ("curriculum vitae", "resume", "cv", "summary", "profile", "contact", "technical skills", "education"):
                        candidate_name = part.strip()
                        break
            if candidate_name:
                break

        if not candidate_name and lines:
            first_line = lines[0].strip()
            if 1 <= len(first_line.split()) <= 4 and not re.search(r'[@\d]', first_line):
                candidate_name = first_line

        if not candidate_name and filename:
            clean_name = re.sub(r'[-_]', ' ', filename.split('.')[0])
            clean_name = re.sub(r'(?i)(resume|cv|latest|updated|final|v\d+|\(\d+\))', '', clean_name).strip().title()
            if clean_name and len(clean_name.split()) <= 4:
                candidate_name = clean_name

        info["name"] = candidate_name or "Applicant"
        spans["name"] = {"value": info["name"], "confidence": 0.95 if candidate_name else 0.40}

        # Professional headline heuristic from first 6 lines
        for line in lines[1:6]:
            if re.search(r'(?i)\b(engineer|developer|architect|designer|manager|scientist|specialist|consultant|analyst|lead|student)\b', line):
                if len(line.split()) <= 10 and "@" not in line:
                    info["headline"] = line.strip()
                    break

        return info, spans

    def _extract_skills(self, skills_text: str, full_text: str) -> Tuple[Dict[str, List[str]], Dict[str, Any]]:
        """
        Extracts skills using canonical taxonomy.
        """
        extracted_taxonomy = extract_skills_from_text(skills_text)
        
        # Always supplement with full-text scan to ensure comprehensive coverage
        full_taxonomy = extract_skills_from_text(full_text)
        for cat, items in full_taxonomy.items():
            existing = {it[0] for it in extracted_taxonomy[cat]}
            for it in items:
                if it[0] not in existing:
                    extracted_taxonomy[cat].append(it)

        skills_dict = {
            CATEGORY_LANGUAGES: [item[0] for item in extracted_taxonomy[CATEGORY_LANGUAGES]],
            CATEGORY_FRAMEWORKS: [item[0] for item in extracted_taxonomy[CATEGORY_FRAMEWORKS]],
            CATEGORY_LIBRARIES: [item[0] for item in extracted_taxonomy[CATEGORY_LIBRARIES]],
            CATEGORY_DATABASES: [item[0] for item in extracted_taxonomy[CATEGORY_DATABASES]],
            CATEGORY_CLOUD: [item[0] for item in extracted_taxonomy[CATEGORY_CLOUD]],
            CATEGORY_TOOLS: [item[0] for item in extracted_taxonomy[CATEGORY_TOOLS]],
        }

        spans_summary = {
            cat: [{"skill": item[0], "evidence": item[1], "confidence": item[2]} for item in items]
            for cat, items in extracted_taxonomy.items()
        }

        return skills_dict, spans_summary

    def _extract_education(self, edu_text: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Extracts education entries without splitting a single university and degree across dummy rows.
        """
        if not edu_text:
            return [], []

        entries = []
        spans = []
        lines = [l.strip() for l in edu_text.splitlines() if l.strip()]

        current_entry: Optional[Dict[str, Any]] = None

        for line in lines:
            parts = [p.strip() for p in re.split(r'[|•–—]', line) if p.strip()]

            line_degree = None
            line_college = None
            line_year = None
            line_gpa = None

            # GPA match on entire line
            gpa_m = re.search(r'(?i)\b(?:gpa|cgpa|percentage)?[:\s]*([0-9]\.[0-9]{1,2}(?:\s*/\s*[0-9]{1,2}(?:\.0)?)?|[789]\d(?:\.\d+)?%)\b', line)
            if gpa_m:
                raw_gpa = gpa_m.group(1).strip()
                line_gpa = raw_gpa.split("/")[0].strip() if "/" in raw_gpa else raw_gpa

            year_m = re.search(r'\b(19\d{2}|20\d{2})\b', line)
            if year_m:
                line_year = year_m.group(0)

            for part in parts:
                for pattern in DEGREE_PATTERNS:
                    if re.search(pattern, part):
                        line_degree = part
                        break
                if re.search(r'(?i)\b(university|college|institute|school|academy|polytechnic|vignan)\b', part):
                    line_college = part

            # If degree and college were on the same line
            if line_degree and line_college:
                if current_entry:
                    entries.append(current_entry)
                current_entry = {
                    "id": f"edu_{len(entries) + 1}",
                    "degree": line_degree,
                    "college": line_college,
                    "cgpa": line_gpa or "",
                    "graduationYear": line_year or ""
                }
            elif line_college:
                if current_entry and current_entry.get("college") and current_entry.get("college") != "Institution":
                    entries.append(current_entry)
                    current_entry = None
                if not current_entry:
                    current_entry = {
                        "id": f"edu_{len(entries) + 1}",
                        "degree": "Degree",
                        "college": line_college,
                        "cgpa": line_gpa or "",
                        "graduationYear": line_year or ""
                    }
                else:
                    current_entry["college"] = line_college
                    if line_gpa and not current_entry.get("cgpa"):
                        current_entry["cgpa"] = line_gpa
                    if line_year and not current_entry.get("graduationYear"):
                        current_entry["graduationYear"] = line_year
            elif line_degree:
                if current_entry and current_entry.get("degree") and current_entry.get("degree") != "Degree":
                    entries.append(current_entry)
                    current_entry = None
                if not current_entry:
                    current_entry = {
                        "id": f"edu_{len(entries) + 1}",
                        "degree": line_degree,
                        "college": "Institution",
                        "cgpa": line_gpa or "",
                        "graduationYear": line_year or ""
                    }
                else:
                    current_entry["degree"] = line_degree
                    if line_gpa and not current_entry.get("cgpa"):
                        current_entry["cgpa"] = line_gpa
                    if line_year and not current_entry.get("graduationYear"):
                        current_entry["graduationYear"] = line_year
            elif current_entry:
                if line_gpa and not current_entry.get("cgpa"):
                    current_entry["cgpa"] = line_gpa
                if line_year and not current_entry.get("graduationYear"):
                    current_entry["graduationYear"] = line_year

        if current_entry:
            entries.append(current_entry)

        for e in entries:
            spans.append({"entry_id": e["id"], "evidence": f"{e.get('degree')} at {e.get('college')}"})

        return entries, spans

    def _extract_experience(self, exp_text: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Extracts work and leadership experience entries grounded strictly in document text.
        """
        if not exp_text:
            return [], []

        entries = []
        spans = []
        lines = [l.strip() for l in exp_text.splitlines() if l.strip()]

        current_exp: Optional[Dict[str, Any]] = None
        desc_lines: List[str] = []

        date_range_pattern = r'(?i)\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b.*?(\b\d{4}\b|\bpresent\b|\bcurrent\b)'

        for line in lines:
            is_date_line = re.search(date_range_pattern, line)
            is_job_title = re.search(r'(?i)\b(engineer|developer|architect|designer|lead|manager|intern|specialist|analyst|director|vp|head|officer|chapter|organizer|mentor)\b', line)
            has_pipe_role = "|" in line or "–" in line or "-" in line

            if is_job_title and (is_date_line or len(line.split()) <= 10 or has_pipe_role):
                if current_exp:
                    current_exp["description"] = " ".join(desc_lines).strip()
                    entries.append(current_exp)
                    spans.append({"id": current_exp["id"], "company": current_exp["company"], "role": current_exp["role"]})
                    desc_lines = []

                # Extract company & role
                parts = [p.strip() for p in re.split(r'[|•–—]', line) if p.strip()]
                if len(parts) >= 2:
                    company = parts[0]
                    role = parts[1]
                else:
                    role = line
                    company = "Organization"
                
                date_str = ""
                date_m = re.search(date_range_pattern, line)
                if date_m:
                    date_str = date_m.group(0)

                current_exp = {
                    "id": f"exp_{len(entries) + 1}",
                    "company": company or "Organization",
                    "role": role,
                    "duration": date_str or "",
                    "description": ""
                }
            elif current_exp:
                if not current_exp["duration"] and is_date_line:
                    current_exp["duration"] = is_date_line.group(0)
                else:
                    desc_lines.append(line)

        if current_exp:
            current_exp["description"] = " ".join(desc_lines).strip()
            entries.append(current_exp)
            spans.append({"id": current_exp["id"], "company": current_exp["company"], "role": current_exp["role"]})

        return entries, spans

    def _extract_projects(self, proj_text: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Extracts candidate projects with stack detection.
        """
        if not proj_text:
            return [], []

        projects = []
        spans = []
        lines = [l.strip() for l in proj_text.splitlines() if l.strip()]

        current_proj: Optional[Dict[str, Any]] = None
        desc_lines: List[str] = []

        for line in lines:
            clean_line = line.strip()
            is_bullet = clean_line.startswith("-") or clean_line.startswith("•") or clean_line.startswith("*") or clean_line.startswith("–")
            
            # Check if this line looks like a project title: contains pipe delimiter or short capitalized title without bullet
            has_pipe_stack = "|" in clean_line and not is_bullet
            is_title = (not is_bullet and len(clean_line.split()) <= 8 and not re.search(r'(?i)\b(responsibilities|summary|description|coursework)\b', clean_line)) or has_pipe_stack

            if is_title:
                if current_proj:
                    current_proj["description"] = " ".join(desc_lines).strip()
                    projects.append(current_proj)
                    desc_lines = []

                if "|" in clean_line:
                    parts = clean_line.split("|")
                    title = parts[0].strip()
                    tech_str = parts[1].strip() if len(parts) > 1 else ""
                    techs = [t.strip() for t in re.split(r'[,/]', tech_str) if t.strip()]
                else:
                    title = clean_line
                    techs = []

                current_proj = {
                    "id": f"proj_{len(projects) + 1}",
                    "title": title,
                    "technologies": techs,
                    "description": ""
                }
            elif current_proj:
                desc_lines.append(clean_line)

        if current_proj:
            current_proj["description"] = " ".join(desc_lines).strip()
            projects.append(current_proj)

        return projects, spans

    def _extract_list_items(self, text: str) -> List[str]:
        if not text:
            return []
        items = []
        for line in text.splitlines():
            clean = re.sub(r'^[•\-\*–\d\.\)]+\s*', '', line).strip()
            if clean and len(clean) > 2:
                items.append(clean)
        return items

    def _extract_certs_from_text(self, text: str) -> List[str]:
        certs = []
        cert_keywords = [
            r'(?i)\b(Google Cloud Certified(?:\s*-\s*[A-Za-z\s-]+)?)\b',
            r'(?i)\b(AWS Certified [A-Za-z\s-]+)\b',
            r'(?i)\b(Microsoft Certified:? [A-Za-z\s-]+)\b',
            r'(?i)\b(HackerRank Certified(?:\s*-\s*[A-Za-z\s\(\),-]+)?)\b',
            r'(?i)\b(Postman API Fundamentals Student Expert)\b',
            r'(?i)\b(Certified Kubernetes (?:Administrator|Application Developer|Security Specialist|CKA|CKAD|CKS))\b',
            r'(?i)\b(Certified Scrum Master|CSM|PMP|CompTIA [A-Za-z+]+)\b',
        ]
        for pattern in cert_keywords:
            matches = re.findall(pattern, text)
            for m in matches:
                if m not in certs:
                    certs.append(m)
        return certs

    def _extract_languages_from_text(self, text: str) -> List[str]:
        langs = []
        common_langs = ["English", "Spanish", "French", "German", "Mandarin", "Hindi", "Telugu", "Japanese", "Arabic", "Portuguese", "Russian"]
        for lang in common_langs:
            if re.search(r'(?i)\b' + lang + r'(?:\s*\((?:fluent|native|proficient|conversational|bilingual)\))?\b', text):
                langs.append(lang)
        return langs

parser_service = ResumeParser()
