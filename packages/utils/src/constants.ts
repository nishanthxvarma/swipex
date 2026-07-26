// App constants
export const APP_NAME = 'SwipeX';
export const APP_DESCRIPTION = 'AI-powered swipe-based job discovery platform';
export const APP_URL = 'https://swipex.example.com';

export const ROLES = {
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  JOB_SEEKER: 'job_seeker'
} as const;

export const JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship'] as const;
export const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'] as const;

export const SKILLS_LIST = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
  'Java', 'C#', 'C++', 'Ruby', 'Go',
  'PHP', 'Swift', 'Kotlin', 'Rust', 'SQL',
  'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
  'GraphQL', 'REST API', 'Vue.js', 'Angular', 'Svelte',
  'Tailwind CSS', 'HTML', 'CSS', 'Sass', 'Less',
  'Git', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Linux',
  'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas',
  'Agile', 'Scrum', 'Jira', 'Figma', 'UI/UX'
];

export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'Manufacturing', 'Retail', 'Media', 'Entertainment', 'Real Estate'
];

export const COMPANY_SIZES = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const SWIPE_THRESHOLD = 120; // pixels for swipe detection
