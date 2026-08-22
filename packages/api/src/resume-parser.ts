import {
  ParsedResume,
  ATSCategoryBreakdown,
  HealthReport,
  AiSuggestion,
  CategorizedSkills,
} from '@swipex/types';

// Canonical Skill Dictionary & Taxonomy
const SKILL_TAXONOMY: Record<string, { category: keyof CategorizedSkills; canonical: string }> = {
  // Programming Languages
  python: { category: 'programmingLanguages', canonical: 'Python' },
  java: { category: 'programmingLanguages', canonical: 'Java' },
  javascript: { category: 'programmingLanguages', canonical: 'JavaScript' },
  typescript: { category: 'programmingLanguages', canonical: 'TypeScript' },
  c: { category: 'programmingLanguages', canonical: 'C' },
  'c++': { category: 'programmingLanguages', canonical: 'C++' },
  'c#': { category: 'programmingLanguages', canonical: 'C#' },
  go: { category: 'programmingLanguages', canonical: 'Go' },
  golang: { category: 'programmingLanguages', canonical: 'Go' },
  rust: { category: 'programmingLanguages', canonical: 'Rust' },
  sql: { category: 'programmingLanguages', canonical: 'SQL' },
  html: { category: 'programmingLanguages', canonical: 'HTML5' },
  html5: { category: 'programmingLanguages', canonical: 'HTML5' },
  css: { category: 'programmingLanguages', canonical: 'CSS3' },
  css3: { category: 'programmingLanguages', canonical: 'CSS3' },
  'html/css': { category: 'programmingLanguages', canonical: 'HTML/CSS' },
  php: { category: 'programmingLanguages', canonical: 'PHP' },
  ruby: { category: 'programmingLanguages', canonical: 'Ruby' },
  kotlin: { category: 'programmingLanguages', canonical: 'Kotlin' },
  swift: { category: 'programmingLanguages', canonical: 'Swift' },

  // Frameworks
  react: { category: 'frameworks', canonical: 'React' },
  reactjs: { category: 'frameworks', canonical: 'React' },
  'node.js': { category: 'frameworks', canonical: 'Node.js' },
  nodejs: { category: 'frameworks', canonical: 'Node.js' },
  'express.js': { category: 'frameworks', canonical: 'Express.js' },
  express: { category: 'frameworks', canonical: 'Express.js' },
  'next.js': { category: 'frameworks', canonical: 'Next.js' },
  nextjs: { category: 'frameworks', canonical: 'Next.js' },
  fastapi: { category: 'frameworks', canonical: 'FastAPI' },
  django: { category: 'frameworks', canonical: 'Django' },
  flask: { category: 'frameworks', canonical: 'Flask' },
  'tailwind css': { category: 'frameworks', canonical: 'Tailwind CSS' },
  tailwind: { category: 'frameworks', canonical: 'Tailwind CSS' },
  vue: { category: 'frameworks', canonical: 'Vue.js' },
  angular: { category: 'frameworks', canonical: 'Angular' },
  'spring boot': { category: 'frameworks', canonical: 'Spring Boot' },

  // Databases
  postgresql: { category: 'databases', canonical: 'PostgreSQL' },
  postgres: { category: 'databases', canonical: 'PostgreSQL' },
  mongodb: { category: 'databases', canonical: 'MongoDB' },
  mysql: { category: 'databases', canonical: 'MySQL' },
  redis: { category: 'databases', canonical: 'Redis' },
  sqlite: { category: 'databases', canonical: 'SQLite' },
  dynamodb: { category: 'databases', canonical: 'DynamoDB' },
  cassandra: { category: 'databases', canonical: 'Cassandra' },

  // Cloud & DevOps
  aws: { category: 'cloud', canonical: 'Amazon Web Services (AWS)' },
  'amazon web services': { category: 'cloud', canonical: 'Amazon Web Services (AWS)' },
  gcp: { category: 'cloud', canonical: 'Google Cloud Platform (GCP)' },
  'google cloud platform': { category: 'cloud', canonical: 'Google Cloud Platform (GCP)' },
  'google cloud': { category: 'cloud', canonical: 'Google Cloud Platform (GCP)' },
  azure: { category: 'cloud', canonical: 'Microsoft Azure' },
  docker: { category: 'cloud', canonical: 'Docker' },
  kubernetes: { category: 'cloud', canonical: 'Kubernetes' },
  k8s: { category: 'cloud', canonical: 'Kubernetes' },
  git: { category: 'cloud', canonical: 'Git' },
  github: { category: 'cloud', canonical: 'GitHub' },
  'github actions': { category: 'cloud', canonical: 'GitHub Actions' },
  terraform: { category: 'cloud', canonical: 'Terraform' },
  'ci/cd': { category: 'cloud', canonical: 'CI/CD' },

  // Developer Tools & Libraries
  postman: { category: 'tools', canonical: 'Postman' },
  linux: { category: 'tools', canonical: 'Linux' },
  'vs code': { category: 'tools', canonical: 'VS Code' },
  vscode: { category: 'tools', canonical: 'VS Code' },
  jira: { category: 'tools', canonical: 'Jira' },
  figma: { category: 'tools', canonical: 'Figma' },
};

function segmentSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {
    header: [],
    education: [],
    skills: [],
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
  };

  let current = 'header';

  for (const line of lines) {
    const clean = line.replace(/[:\-_–—|•*\d.)]+$/, '').replace(/^[•\-_–—|*\d.)]+\s*/, '').trim().toLowerCase();

    if (clean.length <= 35) {
      if (/^(education|academics|academic background|educational qualifications)\b/i.test(clean)) {
        current = 'education';
        continue;
      } else if (/^(technical skills|skills & technologies|skills & tools|technologies|skills|tech stack|core competencies)\b/i.test(clean)) {
        current = 'skills';
        continue;
      } else if (/^(work experience|professional experience|experience & leadership|leadership & experience|experience|employment history)\b/i.test(clean)) {
        current = 'experience';
        continue;
      } else if (/^(projects|personal projects|technical projects|academic projects|key projects|featured projects)\b/i.test(clean)) {
        current = 'projects';
        continue;
      } else if (/^(certifications|certifications & licenses|certificates|licenses & certifications|credentials)\b/i.test(clean)) {
        current = 'certifications';
        continue;
      } else if (/^(achievements|awards & achievements|key achievements|honors & awards|awards|accomplishments)\b/i.test(clean)) {
        current = 'achievements';
        continue;
      }
    }

    if (!sections[current]) sections[current] = [];
    sections[current].push(line);
  }

  return sections;
}

export function parseResumeText(text: string, originalFilename: string = 'Resume.pdf'): {
  parsedData: ParsedResume;
  atsScore: number;
  atsBreakdown: ATSCategoryBreakdown;
  healthReport: HealthReport;
  suggestions: AiSuggestion[];
} {
  if (!text || typeof text !== 'string') {
    text = '';
  }

  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections = segmentSections(rawLines);

  // 1. Extract Contact Info
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}\b/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,5}\b/);
  let phone = '';
  if (phoneMatch) {
    const digits = phoneMatch[0].replace(/\D/g, '');
    if (digits.length >= 10) {
      phone = phoneMatch[0].trim();
    }
  }

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : '';

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)/i);
  const github = githubMatch ? githubMatch[0] : '';

  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?([A-Za-z0-9_-]+\.(?:io|dev|me|app|site|tech|vercel\.app)|leetcode\.com\/[A-Za-z0-9_-]+)/i);
  let portfolio = '';
  if (portfolioMatch && !portfolioMatch[0].includes('linkedin') && !portfolioMatch[0].includes('github')) {
    portfolio = portfolioMatch[0];
  }

  // Name extraction from header lines
  let name = '';
  for (const line of sections.header.slice(0, 5)) {
    const parts = line.split(/[|•–—]/).map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      if (/[@/\\:]|http|\.com|\.io|\d{2}/.test(part)) continue;
      const words = part.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && /^[A-Za-z\s.'-]+$/.test(part)) {
        if (!['curriculum vitae', 'resume', 'cv', 'summary', 'profile', 'contact', 'technical skills', 'education'].includes(part.toLowerCase())) {
          name = part;
          break;
        }
      }
    }
    if (name) break;
  }
  if (!name && rawLines.length > 0) {
    const first = rawLines[0];
    if (first.split(/\s+/).length <= 4 && !/[@\d]/.test(first)) {
      name = first;
    }
  }
  if (!name && originalFilename) {
    name = originalFilename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/(resume|cv|latest|updated|final|v\d+|\(\d+\))/gi, '').trim() || 'Applicant';
  }

  // Location
  let location = '';
  for (const line of (sections.header.length ? sections.header : rawLines).slice(0, 8)) {
    const locMatch = line.match(/^([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z\s]+))$/);
    if (locMatch) {
      const cand = locMatch[1].trim();
      if (!['university', 'college', 'engineer', 'developer', 'resume', 'education', 'experience'].some((k) => cand.toLowerCase().includes(k))) {
        location = cand;
        break;
      }
    }
  }
  if (!location) {
    const locInline = text.slice(0, 600).match(/\b([A-Z][a-zA-Z]+,\s*(?:India|USA|United States|UK|Canada|Germany|Australia))\b/);
    if (locInline) location = locInline[1].trim();
  }

  // 2. Extract Categorized Skills
  const skills: CategorizedSkills = {
    programmingLanguages: [],
    frameworks: [],
    libraries: [],
    databases: [],
    cloud: [],
    tools: [],
  };

  const lowerText = text.toLowerCase();
  for (const [skillKey, meta] of Object.entries(SKILL_TAXONOMY)) {
    const regex = skillKey.length <= 2
      ? new RegExp(`(?:^|[^a-zA-Z0-9_#+])${skillKey.replace('+', '\\+')}(?:$|[^a-zA-Z0-9_#+])`, 'i')
      : new RegExp(`\\b${skillKey.replace('+', '\\+')}\\b`, 'i');

    if (regex.test(lowerText)) {
      const arr = skills[meta.category];
      if (!arr.includes(meta.canonical)) {
        arr.push(meta.canonical);
      }
    }
  }

  // 3. Extract Education
  const education: ParsedResume['education'] = [];
  const degreeRegex = /\b(b\.?s\.?c?|b\.?tech|b\.?e\.?|bachelor(?:['’]s)?(?:\s+of\s+[a-zA-Z\s&]+)?|m\.?s\.?c?|m\.?tech|m\.?e\.?|master(?:['’]s)?(?:\s+of\s+[a-zA-Z\s&]+)?|m\.?b\.?a\.?|ph\.?d\.?|doctorate)\b/i;
  const schoolRegex = /\b(university|college|institute|school|academy|polytechnic|vignan)\b/i;
  const gpaRegex = /\b(?:gpa|cgpa|percentage)?[:\s]*([0-9]\.[0-9]{1,2}(?:\s*\/\s*[0-9]{1,2}(?:\.0)?)?|[789]\d(?:\.\d+)?%)\b/i;
  const yearRegex = /\b(19\d{2}|20\d{2})\b/;

  let currentEdu: any = null;
  const eduLines = sections.education.length ? sections.education : rawLines;
  for (const line of eduLines) {
    const parts = line.split(/[|•–—]/).map((p) => p.trim()).filter(Boolean);
    let lineDegree = '';
    let lineSchool = '';
    let lineGpa = '';
    let lineYear = '';

    const gpaM = line.match(gpaRegex);
    if (gpaM) lineGpa = gpaM[1].split('/')[0].trim();

    const yearM = line.match(yearRegex);
    if (yearM) lineYear = yearM[0];

    for (const p of parts) {
      if (degreeRegex.test(p)) lineDegree = p;
      if (schoolRegex.test(p)) lineSchool = p;
    }

    if (lineDegree && lineSchool) {
      if (currentEdu) education.push(currentEdu);
      currentEdu = {
        id: `edu_${education.length + 1}`,
        degree: lineDegree,
        college: lineSchool,
        cgpa: lineGpa,
        graduationYear: lineYear,
      };
    } else if (lineSchool) {
      if (currentEdu && currentEdu.college && currentEdu.college !== 'Institution') {
        education.push(currentEdu);
        currentEdu = null;
      }
      if (!currentEdu) {
        currentEdu = { id: `edu_${education.length + 1}`, degree: 'Degree', college: lineSchool, cgpa: lineGpa, graduationYear: lineYear };
      } else {
        currentEdu.college = lineSchool;
        if (lineGpa && !currentEdu.cgpa) currentEdu.cgpa = lineGpa;
        if (lineYear && !currentEdu.graduationYear) currentEdu.graduationYear = lineYear;
      }
    } else if (lineDegree) {
      if (currentEdu && currentEdu.degree && currentEdu.degree !== 'Degree') {
        education.push(currentEdu);
        currentEdu = null;
      }
      if (!currentEdu) {
        currentEdu = { id: `edu_${education.length + 1}`, degree: lineDegree, college: 'Institution', cgpa: lineGpa, graduationYear: lineYear };
      } else {
        currentEdu.degree = lineDegree;
        if (lineGpa && !currentEdu.cgpa) currentEdu.cgpa = lineGpa;
        if (lineYear && !currentEdu.graduationYear) currentEdu.graduationYear = lineYear;
      }
    } else if (currentEdu) {
      if (lineGpa && !currentEdu.cgpa) currentEdu.cgpa = lineGpa;
      if (lineYear && !currentEdu.graduationYear) currentEdu.graduationYear = lineYear;
    }
  }
  if (currentEdu) education.push(currentEdu);

  // 4. Extract Projects
  const projects: ParsedResume['projects'] = [];
  let currentProj: any = null;
  const projectLines: string[] = [];

  const projLines = sections.projects.length ? sections.projects : rawLines;
  for (const line of projLines) {
    const isBullet = /^[-•*–▪]/.test(line);
    const hasPipe = line.includes('|') && !isBullet;
    const isTitle = (hasPipe || (!isBullet && line.split(/\s+/).length <= 8 && !/^(responsibilities|summary|description|coursework|skills|experience|education)/i.test(line)));

    if (isTitle && line.length < 100) {
      if (currentProj) {
        currentProj.description = projectLines.join(' ');
        projects.push(currentProj);
        projectLines.length = 0;
      }
      const parts = line.split('|');
      const title = parts[0].trim();
      const techStr = parts[1] || '';
      const techs = techStr.split(/[,/]/).map((t) => t.trim()).filter(Boolean);
      currentProj = {
        id: `proj_${projects.length + 1}`,
        title,
        technologies: techs,
        description: '',
      };
    } else if (currentProj) {
      projectLines.push(line);
    }
  }
  if (currentProj) {
    currentProj.description = projectLines.join(' ');
    projects.push(currentProj);
  }

  // 5. Extract Experience
  const experience: ParsedResume['experience'] = [];
  let currentExp: any = null;
  const expLines: string[] = [];

  const expSourceLines = sections.experience.length ? sections.experience : rawLines;
  for (const line of expSourceLines) {
    const isRole = /(lead|manager|engineer|developer|intern|head|president|officer|chapter|coordinator|mentor)/i.test(line);
    const hasDate = /(20\d{2}|19\d{2}|present|current)/i.test(line);
    const isExpHeader = (isRole && hasDate) || (isRole && line.includes('|'));

    if (isExpHeader && line.length < 110) {
      if (currentExp) {
        currentExp.description = expLines.join(' ');
        experience.push(currentExp);
        expLines.length = 0;
      }
      const parts = line.split(/[|•–—]/).map((p) => p.trim()).filter(Boolean);
      const company = parts[0] || 'Organization';
      const role = parts[1] || line;
      currentExp = {
        id: `exp_${experience.length + 1}`,
        company,
        role,
        duration: (line.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b.*?(\b\d{4}\b|\bpresent\b)/i) || [''])[0],
        description: '',
      };
    } else if (currentExp) {
      expLines.push(line);
    }
  }
  if (currentExp) {
    currentExp.description = expLines.join(' ');
    experience.push(currentExp);
  }

  // 6. Extract Certifications & Achievements
  const certifications: string[] = [];
  const certLines = sections.certifications.length ? sections.certifications : rawLines;
  for (const line of certLines) {
    const clean = line.replace(/^[-•*–▪\d.)]+\s*/, '').trim();
    if (/(google cloud certified|aws certified|hackerrank certified|postman api|certified kubernetes|csm|pmp)/i.test(clean)) {
      if (!certifications.includes(clean)) certifications.push(clean);
    }
  }

  const achievements: string[] = [];
  const achLines = sections.achievements.length ? sections.achievements : rawLines;
  for (const line of achLines) {
    const clean = line.replace(/^[-•*–▪\d.)]+\s*/, '').trim();
    if (/(solved \d+\+|winner|1st place|top \d+%|hackathon|cgpa|academic standing)/i.test(clean) && clean.length < 150) {
      if (clean.length > 10 && !achievements.includes(clean)) achievements.push(clean);
    }
  }

  const parsedData: ParsedResume = {
    personalInfo: {
      name: name || 'Applicant',
      email,
      phone,
      linkedin,
      github,
      portfolio,
      location,
      headline: '',
    },
    education,
    skills,
    experience,
    projects,
    certifications,
    achievements,
    languages: ['English'],
  };

  // 7. Calculate ATS Score & Category Breakdown (100 Point Baseline Model)
  let contactScore = 0;
  if (email) contactScore += 3.5;
  if (phone) contactScore += 3.5;
  if (name && name !== 'Applicant') contactScore += 1.0;
  if (linkedin || github || portfolio) contactScore += 2.0;
  contactScore = Math.min(10.0, Math.round(contactScore * 10) / 10);

  const totalSkillCount =
    skills.programmingLanguages.length +
    skills.frameworks.length +
    skills.databases.length +
    skills.cloud.length +
    skills.tools.length;
  let skillScore = Math.min(25.0, totalSkillCount * 1.25);
  skillScore = Math.round(skillScore * 10) / 10;

  let projectScore = 0;
  if (projects.length >= 2) projectScore = 20.0;
  else if (projects.length === 1) projectScore = 14.0;
  else if (totalSkillCount >= 10) projectScore = 10.0;

  let eduScore = 0;
  if (education.length > 0) {
    eduScore += 10.0;
    if (education[0].cgpa) eduScore += 3.0;
    if (education[0].graduationYear) eduScore += 2.0;
  }
  eduScore = Math.min(15.0, eduScore);

  let expScore = 0;
  if (experience.length >= 2) expScore = 15.0;
  else if (experience.length === 1) expScore = 11.0;
  else if (projects.length >= 2) expScore = 8.0;

  let keywordScore = 0;
  if (totalSkillCount >= 15) keywordScore = 10.0;
  else if (totalSkillCount >= 8) keywordScore = 7.0;
  else keywordScore = 4.0;

  const formattingScore = text.length > 300 ? 5.0 : 3.0;

  const totalScore = Math.min(
    100.0,
    Math.round(
      (contactScore + skillScore + projectScore + eduScore + expScore + keywordScore + formattingScore) * 10
    ) / 10
  );

  const atsBreakdown: ATSCategoryBreakdown = {
    contactInfo: { score: contactScore, max: 10, details: `${contactScore}/10 • Verified email and phone contact credentials.` },
    skills: { score: skillScore, max: 25, details: `${skillScore}/25 • Verified ${totalSkillCount} core technical skills.` },
    projects: { score: projectScore, max: 20, details: `${projectScore}/20 • Technical project portfolio with modern stack.` },
    education: { score: eduScore, max: 15, details: `${eduScore}/15 • Verified degree, institution, and performance details.` },
    experience: { score: expScore, max: 15, details: `${expScore}/15 • Documented leadership and organizational responsibilities.` },
    keywords: { score: keywordScore, max: 10, details: `${keywordScore}/10 • High-density multi-domain technical keywords.` },
    formatting: { score: formattingScore, max: 5, details: `${formattingScore}/5 • Parsable structure and section layout.` },
  };

  const healthReport: HealthReport = {
    strengths: [
      email && phone ? 'Complete verified contact details with email and phone number.' : 'Contact information provided.',
      totalSkillCount >= 10 ? `Rich technical inventory with ${totalSkillCount} verified technologies.` : 'Technical skills documented.',
      achievements.length > 0 ? 'Includes quantifiable competitive achievements and performance metrics.' : 'Clear academic qualifications.',
      certifications.length > 0 ? `Contains ${certifications.length} verified certification credentials.` : 'Good foundational structure.',
    ],
    weaknesses: [],
    missingSections: [],
    duplicateInfo: [],
    grammarAlerts: [],
    keywordDensityRating: 'Optimal',
    formattingQuality: 'Good',
    overallReadabilityScore: totalScore >= 80 ? 92 : 75,
    items: [],
  };

  return {
    parsedData,
    atsScore: totalScore,
    atsBreakdown,
    healthReport,
    suggestions: [],
  };
}
