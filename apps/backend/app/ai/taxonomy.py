"""
SwipeX Controlled Skill Taxonomy and Normalization Engine.
Contains canonical skills, category taxonomies, alias maps, and boundary-aware regex matchers.
"""

import re
from typing import Dict, List, Set, Tuple, Optional

# Canonical categories
CATEGORY_LANGUAGES = "programmingLanguages"
CATEGORY_FRAMEWORKS = "frameworks"
CATEGORY_LIBRARIES = "libraries"
CATEGORY_DATABASES = "databases"
CATEGORY_CLOUD = "cloud"
CATEGORY_TOOLS = "tools"
CATEGORY_CONCEPTS = "concepts"
CATEGORY_SOFT_SKILLS = "softSkills"

# Canonical Skill Taxonomy mapping: Canonical Name -> Category
CANONICAL_SKILLS: Dict[str, str] = {
    # Programming Languages
    "Python": CATEGORY_LANGUAGES,
    "JavaScript": CATEGORY_LANGUAGES,
    "TypeScript": CATEGORY_LANGUAGES,
    "Java": CATEGORY_LANGUAGES,
    "C++": CATEGORY_LANGUAGES,
    "C#": CATEGORY_LANGUAGES,
    "C": CATEGORY_LANGUAGES,
    "Go": CATEGORY_LANGUAGES,
    "Rust": CATEGORY_LANGUAGES,
    "Ruby": CATEGORY_LANGUAGES,
    "PHP": CATEGORY_LANGUAGES,
    "Swift": CATEGORY_LANGUAGES,
    "Kotlin": CATEGORY_LANGUAGES,
    "R": CATEGORY_LANGUAGES,
    "MATLAB": CATEGORY_LANGUAGES,
    "Scala": CATEGORY_LANGUAGES,
    "Dart": CATEGORY_LANGUAGES,
    "HTML5": CATEGORY_LANGUAGES,
    "CSS3": CATEGORY_LANGUAGES,
    "SQL": CATEGORY_LANGUAGES,
    "Shell / Bash": CATEGORY_LANGUAGES,
    "Perl": CATEGORY_LANGUAGES,
    "Lua": CATEGORY_LANGUAGES,
    "Julia": CATEGORY_LANGUAGES,
    "Haskell": CATEGORY_LANGUAGES,
    "Elixir": CATEGORY_LANGUAGES,
    "Clojure": CATEGORY_LANGUAGES,
    "Groovy": CATEGORY_LANGUAGES,
    "Solidity": CATEGORY_LANGUAGES,

    # Frameworks
    "React": CATEGORY_FRAMEWORKS,
    "Next.js": CATEGORY_FRAMEWORKS,
    "Vue.js": CATEGORY_FRAMEWORKS,
    "Angular": CATEGORY_FRAMEWORKS,
    "Svelte": CATEGORY_FRAMEWORKS,
    "SvelteKit": CATEGORY_FRAMEWORKS,
    "Node.js": CATEGORY_FRAMEWORKS,
    "Express.js": CATEGORY_FRAMEWORKS,
    "FastAPI": CATEGORY_FRAMEWORKS,
    "Django": CATEGORY_FRAMEWORKS,
    "Flask": CATEGORY_FRAMEWORKS,
    "Spring Boot": CATEGORY_FRAMEWORKS,
    "Spring": CATEGORY_FRAMEWORKS,
    "Laravel": CATEGORY_FRAMEWORKS,
    "NestJS": CATEGORY_FRAMEWORKS,
    "Ruby on Rails": CATEGORY_FRAMEWORKS,
    "ASP.NET Core": CATEGORY_FRAMEWORKS,
    "ASP.NET": CATEGORY_FRAMEWORKS,
    "Flutter": CATEGORY_FRAMEWORKS,
    "React Native": CATEGORY_FRAMEWORKS,
    "Tailwind CSS": CATEGORY_FRAMEWORKS,
    "Bootstrap": CATEGORY_FRAMEWORKS,
    "Nuxt.js": CATEGORY_FRAMEWORKS,
    "Gatsby": CATEGORY_FRAMEWORKS,
    "Remix": CATEGORY_FRAMEWORKS,
    "Fastify": CATEGORY_FRAMEWORKS,
    "Koa": CATEGORY_FRAMEWORKS,
    "Tornado": CATEGORY_FRAMEWORKS,
    "Gin": CATEGORY_FRAMEWORKS,
    "Echo": CATEGORY_FRAMEWORKS,
    "Actix Web": CATEGORY_FRAMEWORKS,
    "Symfony": CATEGORY_FRAMEWORKS,
    "CodeIgniter": CATEGORY_FRAMEWORKS,
    "Electron": CATEGORY_FRAMEWORKS,
    "Tauri": CATEGORY_FRAMEWORKS,
    "Ionic": CATEGORY_FRAMEWORKS,

    # Libraries
    "Redux": CATEGORY_LIBRARIES,
    "Redux Toolkit": CATEGORY_LIBRARIES,
    "Zustand": CATEGORY_LIBRARIES,
    "TanStack Query (React Query)": CATEGORY_LIBRARIES,
    "Pandas": CATEGORY_LIBRARIES,
    "NumPy": CATEGORY_LIBRARIES,
    "SciPy": CATEGORY_LIBRARIES,
    "Scikit-learn": CATEGORY_LIBRARIES,
    "TensorFlow": CATEGORY_LIBRARIES,
    "PyTorch": CATEGORY_LIBRARIES,
    "Keras": CATEGORY_LIBRARIES,
    "spaCy": CATEGORY_LIBRARIES,
    "NLTK": CATEGORY_LIBRARIES,
    "Hugging Face Transformers": CATEGORY_LIBRARIES,
    "LangChain": CATEGORY_LIBRARIES,
    "LlamaIndex": CATEGORY_LIBRARIES,
    "OpenCV": CATEGORY_LIBRARIES,
    "Framer Motion": CATEGORY_LIBRARIES,
    "Material UI (MUI)": CATEGORY_LIBRARIES,
    "shadcn/ui": CATEGORY_LIBRARIES,
    "Chakra UI": CATEGORY_LIBRARIES,
    "Ant Design": CATEGORY_LIBRARIES,
    "Axios": CATEGORY_LIBRARIES,
    "RxJS": CATEGORY_LIBRARIES,
    "SQLAlchemy": CATEGORY_LIBRARIES,
    "Prisma": CATEGORY_LIBRARIES,
    "Drizzle ORM": CATEGORY_LIBRARIES,
    "Mongoose": CATEGORY_LIBRARIES,
    "TypeORM": CATEGORY_LIBRARIES,
    "Hibernate": CATEGORY_LIBRARIES,
    "GraphQL": CATEGORY_LIBRARIES,
    "Apollo Client": CATEGORY_LIBRARIES,
    "pydantic": CATEGORY_LIBRARIES,
    "Celery": CATEGORY_LIBRARIES,
    "Pytest": CATEGORY_LIBRARIES,
    "Jest": CATEGORY_LIBRARIES,
    "Mocha": CATEGORY_LIBRARIES,
    "Cypress": CATEGORY_LIBRARIES,
    "Playwright": CATEGORY_LIBRARIES,
    "Selenium": CATEGORY_LIBRARIES,
    "Storybook": CATEGORY_LIBRARIES,

    # Databases & Storage
    "PostgreSQL": CATEGORY_DATABASES,
    "MySQL": CATEGORY_DATABASES,
    "SQLite": CATEGORY_DATABASES,
    "MongoDB": CATEGORY_DATABASES,
    "Redis": CATEGORY_DATABASES,
    "Cassandra": CATEGORY_DATABASES,
    "DynamoDB": CATEGORY_DATABASES,
    "Elasticsearch": CATEGORY_DATABASES,
    "Neo4j": CATEGORY_DATABASES,
    "MariaDB": CATEGORY_DATABASES,
    "Supabase": CATEGORY_DATABASES,
    "Firebase": CATEGORY_DATABASES,
    "Oracle DB": CATEGORY_DATABASES,
    "Microsoft SQL Server": CATEGORY_DATABASES,
    "CouchDB": CATEGORY_DATABASES,
    "ClickHouse": CATEGORY_DATABASES,
    "Snowflake": CATEGORY_DATABASES,
    "BigQuery": CATEGORY_DATABASES,
    "Amazon Redshift": CATEGORY_DATABASES,
    "ChromaDB": CATEGORY_DATABASES,
    "Pinecone": CATEGORY_DATABASES,
    "Weaviate": CATEGORY_DATABASES,
    "Qdrant": CATEGORY_DATABASES,
    "Milvus": CATEGORY_DATABASES,
    "Faiss": CATEGORY_DATABASES,

    # Cloud & DevOps
    "Amazon Web Services (AWS)": CATEGORY_CLOUD,
    "Microsoft Azure": CATEGORY_CLOUD,
    "Google Cloud Platform (GCP)": CATEGORY_CLOUD,
    "Docker": CATEGORY_CLOUD,
    "Kubernetes": CATEGORY_CLOUD,
    "Terraform": CATEGORY_CLOUD,
    "Ansible": CATEGORY_CLOUD,
    "Helm": CATEGORY_CLOUD,
    "Vercel": CATEGORY_CLOUD,
    "Netlify": CATEGORY_CLOUD,
    "Heroku": CATEGORY_CLOUD,
    "DigitalOcean": CATEGORY_CLOUD,
    "Cloudflare": CATEGORY_CLOUD,
    "AWS Lambda": CATEGORY_CLOUD,
    "Amazon S3": CATEGORY_CLOUD,
    "Amazon EC2": CATEGORY_CLOUD,
    "Amazon ECS": CATEGORY_CLOUD,
    "Amazon EKS": CATEGORY_CLOUD,
    "Amazon SQS": CATEGORY_CLOUD,
    "Amazon SNS": CATEGORY_CLOUD,
    "Google Kubernetes Engine (GKE)": CATEGORY_CLOUD,
    "Azure DevOps": CATEGORY_CLOUD,
    "Prometheus": CATEGORY_CLOUD,
    "Grafana": CATEGORY_CLOUD,
    "Datadog": CATEGORY_CLOUD,
    "Splunk": CATEGORY_CLOUD,
    "ELK Stack": CATEGORY_CLOUD,
    "Nginx": CATEGORY_CLOUD,
    "Apache": CATEGORY_CLOUD,
    "Traefik": CATEGORY_CLOUD,
    "OpenShift": CATEGORY_CLOUD,
    "ArgoCD": CATEGORY_CLOUD,

    # Tools & Methodologies
    "Git": CATEGORY_TOOLS,
    "GitHub": CATEGORY_TOOLS,
    "GitLab": CATEGORY_TOOLS,
    "Bitbucket": CATEGORY_TOOLS,
    "CI/CD": CATEGORY_TOOLS,
    "GitHub Actions": CATEGORY_TOOLS,
    "GitLab CI": CATEGORY_TOOLS,
    "Jenkins": CATEGORY_TOOLS,
    "CircleCI": CATEGORY_TOOLS,
    "Travis CI": CATEGORY_TOOLS,
    "Jira": CATEGORY_TOOLS,
    "Confluence": CATEGORY_TOOLS,
    "Figma": CATEGORY_TOOLS,
    "Postman": CATEGORY_TOOLS,
    "Swagger / OpenAPI": CATEGORY_TOOLS,
    "Vite": CATEGORY_TOOLS,
    "Webpack": CATEGORY_TOOLS,
    "Babel": CATEGORY_TOOLS,
    "npm": CATEGORY_TOOLS,
    "Yarn": CATEGORY_TOOLS,
    "pnpm": CATEGORY_TOOLS,
    "Linux": CATEGORY_TOOLS,
    "Kafka": CATEGORY_TOOLS,
    "RabbitMQ": CATEGORY_TOOLS,
    "Apache Spark": CATEGORY_TOOLS,
    "Apache Flink": CATEGORY_TOOLS,
    "Apache Airflow": CATEGORY_TOOLS,
    "dbt": CATEGORY_TOOLS,

    # Architecture & Concepts
    "RESTful APIs": CATEGORY_CONCEPTS,
    "Microservices": CATEGORY_CONCEPTS,
    "System Design": CATEGORY_CONCEPTS,
    "Object-Oriented Programming (OOP)": CATEGORY_CONCEPTS,
    "Functional Programming": CATEGORY_CONCEPTS,
    "Data Structures & Algorithms": CATEGORY_CONCEPTS,
    "Agile / Scrum": CATEGORY_CONCEPTS,
    "Test-Driven Development (TDD)": CATEGORY_CONCEPTS,
    "Continuous Integration / Continuous Deployment": CATEGORY_CONCEPTS,
    "Design Patterns": CATEGORY_CONCEPTS,
    "Event-Driven Architecture": CATEGORY_CONCEPTS,
    "Serverless Architecture": CATEGORY_CONCEPTS,
    "Database Optimization": CATEGORY_CONCEPTS,
    "WebSockets": CATEGORY_CONCEPTS,
    "gRPC": CATEGORY_CONCEPTS,
    "OAuth 2.0 / OIDC": CATEGORY_CONCEPTS,
    "JWT Authentication": CATEGORY_CONCEPTS,
    "Search Engine Optimization (SEO)": CATEGORY_CONCEPTS,
    "Web Accessibility (WCAG / a11y)": CATEGORY_CONCEPTS,
    "Large Language Models (LLMs)": CATEGORY_CONCEPTS,
    "Retrieval-Augmented Generation (RAG)": CATEGORY_CONCEPTS,
    "Vector Embeddings": CATEGORY_CONCEPTS,
    "Natural Language Processing (NLP)": CATEGORY_CONCEPTS,
    "Computer Vision": CATEGORY_CONCEPTS,
    "Machine Learning": CATEGORY_CONCEPTS,
    "Deep Learning": CATEGORY_CONCEPTS,
}

# Master lookup dict combining aliases and canonical names
ALL_SEARCH_TERMS: Dict[str, str] = {}

# 1. Add all canonical names
for canonical in CANONICAL_SKILLS:
    ALL_SEARCH_TERMS[canonical.lower()] = canonical

# 2. Add aliases
SKILL_ALIASES: Dict[str, str] = {
    # Languages
    "python": "Python",
    "py": "Python",
    "python3": "Python",
    "python 3": "Python",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "ecmascript": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "golang": "Go",
    "go lang": "Go",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "c sharp": "C#",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "sql": "SQL",
    "bash": "Shell / Bash",
    "shell": "Shell / Bash",
    "zsh": "Shell / Bash",
    "powershell": "Shell / Bash",

    # Frameworks
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "next": "Next.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "next 14": "Next.js",
    "next 15": "Next.js",
    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "vuejs": "Vue.js",
    "angular": "Angular",
    "angular.js": "Angular",
    "angularjs": "Angular",
    "angular 2+": "Angular",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express.js",
    "express.js": "Express.js",
    "expressjs": "Express.js",
    "fastapi": "FastAPI",
    "fast api": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring",
    "springboot": "Spring Boot",
    "spring boot": "Spring Boot",
    "spring-boot": "Spring Boot",
    "nest": "NestJS",
    "nest.js": "NestJS",
    "nestjs": "NestJS",
    "rails": "Ruby on Rails",
    "ruby on rails": "Ruby on Rails",
    "ror": "Ruby on Rails",
    "asp.net": "ASP.NET",
    "asp.net core": "ASP.NET Core",
    ".net core": "ASP.NET Core",
    ".net": "ASP.NET",
    "dotnet": "ASP.NET",
    "react native": "React Native",
    "react-native": "React Native",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "tailwind-css": "Tailwind CSS",
    "flutter": "Flutter",

    # Libraries
    "redux": "Redux",
    "redux toolkit": "Redux Toolkit",
    "rtk": "Redux Toolkit",
    "zustand": "Zustand",
    "react query": "TanStack Query (React Query)",
    "react-query": "TanStack Query (React Query)",
    "tanstack query": "TanStack Query (React Query)",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scipy": "SciPy",
    "scikit-learn": "Scikit-learn",
    "scikit learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "keras": "Keras",
    "spacy": "spaCy",
    "nltk": "NLTK",
    "huggingface": "Hugging Face Transformers",
    "transformers": "Hugging Face Transformers",
    "langchain": "LangChain",
    "llamaindex": "LlamaIndex",
    "llama index": "LlamaIndex",
    "framer motion": "Framer Motion",
    "framer-motion": "Framer Motion",
    "mui": "Material UI (MUI)",
    "material ui": "Material UI (MUI)",
    "material-ui": "Material UI (MUI)",
    "shadcn": "shadcn/ui",
    "shadcn ui": "shadcn/ui",
    "shadcn/ui": "shadcn/ui",
    "chakra": "Chakra UI",
    "chakra ui": "Chakra UI",
    "axios": "Axios",
    "rxjs": "RxJS",
    "sqlalchemy": "SQLAlchemy",
    "prisma": "Prisma",
    "drizzle": "Drizzle ORM",
    "drizzle orm": "Drizzle ORM",
    "mongoose": "Mongoose",
    "typeorm": "TypeORM",
    "graphql": "GraphQL",
    "apollo": "Apollo Client",
    "pydantic": "pydantic",
    "pytest": "Pytest",
    "jest": "Jest",
    "cypress": "Cypress",
    "playwright": "Playwright",

    # Databases
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "mysql": "MySQL",
    "sqlite": "SQLite",
    "sqlite3": "SQLite",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "cassandra": "Cassandra",
    "dynamodb": "DynamoDB",
    "dynamo db": "DynamoDB",
    "elastic": "Elasticsearch",
    "elasticsearch": "Elasticsearch",
    "es": "Elasticsearch",
    "neo4j": "Neo4j",
    "mariadb": "MariaDB",
    "supabase": "Supabase",
    "firebase": "Firebase",
    "firestore": "Firebase",
    "mssql": "Microsoft SQL Server",
    "sql server": "Microsoft SQL Server",
    "snowflake": "Snowflake",
    "bigquery": "BigQuery",
    "big query": "BigQuery",
    "redshift": "Amazon Redshift",
    "pinecone": "Pinecone",
    "chromadb": "ChromaDB",
    "chroma db": "ChromaDB",
    "weaviate": "Weaviate",
    "qdrant": "Qdrant",
    "faiss": "Faiss",

    # Cloud & DevOps
    "aws": "Amazon Web Services (AWS)",
    "amazon web services": "Amazon Web Services (AWS)",
    "azure": "Microsoft Azure",
    "ms azure": "Microsoft Azure",
    "gcp": "Google Cloud Platform (GCP)",
    "google cloud": "Google Cloud Platform (GCP)",
    "google cloud platform": "Google Cloud Platform (GCP)",
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "helm": "Helm",
    "vercel": "Vercel",
    "netlify": "Netlify",
    "heroku": "Heroku",
    "digitalocean": "DigitalOcean",
    "digital ocean": "DigitalOcean",
    "cloudflare": "Cloudflare",
    "lambda": "AWS Lambda",
    "aws lambda": "AWS Lambda",
    "s3": "Amazon S3",
    "amazon s3": "Amazon S3",
    "ec2": "Amazon EC2",
    "amazon ec2": "Amazon EC2",
    "ecs": "Amazon ECS",
    "eks": "Amazon EKS",
    "sqs": "Amazon SQS",
    "sns": "Amazon SNS",
    "gke": "Google Kubernetes Engine (GKE)",
    "prometheus": "Prometheus",
    "grafana": "Grafana",
    "datadog": "Datadog",
    "nginx": "Nginx",
    "apache": "Apache",

    # Tools
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "bitbucket": "Bitbucket",
    "ci/cd": "CI/CD",
    "ci cd": "CI/CD",
    "cicd": "CI/CD",
    "continuous integration": "CI/CD",
    "continuous deployment": "CI/CD",
    "github actions": "GitHub Actions",
    "gh actions": "GitHub Actions",
    "jenkins": "Jenkins",
    "circleci": "CircleCI",
    "jira": "Jira",
    "confluence": "Confluence",
    "figma": "Figma",
    "postman": "Postman",
    "swagger": "Swagger / OpenAPI",
    "openapi": "Swagger / OpenAPI",
    "vite": "Vite",
    "webpack": "Webpack",
    "babel": "Babel",
    "npm": "npm",
    "yarn": "Yarn",
    "pnpm": "pnpm",
    "linux": "Linux",
    "kafka": "Kafka",
    "apache kafka": "Kafka",
    "rabbitmq": "RabbitMQ",
    "spark": "Apache Spark",
    "apache spark": "Apache Spark",
    "airflow": "Apache Airflow",
    "dbt": "dbt",

    # Concepts
    "rest": "RESTful APIs",
    "rest api": "RESTful APIs",
    "rest apis": "RESTful APIs",
    "restful": "RESTful APIs",
    "restful apis": "RESTful APIs",
    "microservices": "Microservices",
    "microservice": "Microservices",
    "system design": "System Design",
    "oop": "Object-Oriented Programming (OOP)",
    "object oriented programming": "Object-Oriented Programming (OOP)",
    "functional programming": "Functional Programming",
    "dsa": "Data Structures & Algorithms",
    "data structures": "Data Structures & Algorithms",
    "algorithms": "Data Structures & Algorithms",
    "agile": "Agile / Scrum",
    "scrum": "Agile / Scrum",
    "tdd": "Test-Driven Development (TDD)",
    "test driven development": "Test-Driven Development (TDD)",
    "websockets": "WebSockets",
    "websocket": "WebSockets",
    "grpc": "gRPC",
    "oauth": "OAuth 2.0 / OIDC",
    "oauth2": "OAuth 2.0 / OIDC",
    "oauth 2.0": "OAuth 2.0 / OIDC",
    "jwt": "JWT Authentication",
    "seo": "Search Engine Optimization (SEO)",
    "a11y": "Web Accessibility (WCAG / a11y)",
    "accessibility": "Web Accessibility (WCAG / a11y)",
    "llm": "Large Language Models (LLMs)",
    "llms": "Large Language Models (LLMs)",
    "rag": "Retrieval-Augmented Generation (RAG)",
    "vector search": "Vector Embeddings",
    "embeddings": "Vector Embeddings",
    "nlp": "Natural Language Processing (NLP)",
    "computer vision": "Computer Vision",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "ai": "Machine Learning",
}

for k, v in SKILL_ALIASES.items():
    ALL_SEARCH_TERMS[k] = v

# Compile boundary-safe regex patterns for each alias
# Special handling for single-character or punct-heavy terms (C, C++, C#, R, Go, .NET)
SPECIAL_PATTERNS = {
    "c": r'(?<![a-zA-Z0-9_])C(?![a-zA-Z0-9_#+])',
    "r": r'(?<![a-zA-Z0-9_])R(?![a-zA-Z0-9_])',
    "go": r'\b(Go|Golang)\b',
    "c++": r'(?<![a-zA-Z0-9_])C\+\+(?![a-zA-Z0-9_])',
    "c#": r'(?<![a-zA-Z0-9_])C#(?![a-zA-Z0-9_])',
    ".net": r'(?<![a-zA-Z0-9_])\.NET(?![a-zA-Z0-9_])',
}

def normalize_skill(skill_str: str) -> Optional[str]:
    """
    Normalizes a skill string to its canonical representation.
    """
    if not skill_str:
        return None
    clean = skill_str.strip().lower()
    # Remove leading/trailing quotes and punctuation
    clean = re.sub(r'^[^\w\+#\.]+|[^\w\+#\.]+$', '', clean)
    
    if clean in ALL_SEARCH_TERMS:
        return ALL_SEARCH_TERMS[clean]
    
    # Direct canonical match
    for canonical in CANONICAL_SKILLS:
        if canonical.lower() == clean:
            return canonical
            
    return skill_str.strip().title()

def get_skill_category(canonical_skill: str) -> str:
    """
    Returns the categorized taxonomy bucket for a canonical skill.
    """
    return CANONICAL_SKILLS.get(canonical_skill, CATEGORY_TOOLS)

def extract_skills_from_text(text: str) -> Dict[str, List[Tuple[str, str, float]]]:
    """
    Extracts all canonical skills found in text with source evidence snippet and confidence.
    Returns: Dict[Category, List[Tuple[CanonicalSkill, EvidenceSnippet, ConfidenceScore]]]
    """
    if not text:
        return {
            CATEGORY_LANGUAGES: [],
            CATEGORY_FRAMEWORKS: [],
            CATEGORY_LIBRARIES: [],
            CATEGORY_DATABASES: [],
            CATEGORY_CLOUD: [],
            CATEGORY_TOOLS: []
        }

    results: Dict[str, List[Tuple[str, str, float]]] = {
        CATEGORY_LANGUAGES: [],
        CATEGORY_FRAMEWORKS: [],
        CATEGORY_LIBRARIES: [],
        CATEGORY_DATABASES: [],
        CATEGORY_CLOUD: [],
        CATEGORY_TOOLS: []
    }
    
    found_canonicals: Set[str] = set()

    # 1. Match special patterns first
    for term, pattern in SPECIAL_PATTERNS.items():
        matches = list(re.finditer(pattern, text))
        if matches:
            canonical = ALL_SEARCH_TERMS.get(term) or (term.upper() if len(term) <= 3 else term.title())
            if canonical not in found_canonicals:
                found_canonicals.add(canonical)
                cat = get_skill_category(canonical)
                target_cat = cat if cat in results else CATEGORY_TOOLS
                match_span = matches[0].span()
                # Get snippet window
                start = max(0, match_span[0] - 25)
                end = min(len(text), match_span[1] + 25)
                evidence = text[start:end].replace('\n', ' ').strip()
                results[target_cat].append((canonical, evidence, 0.98))

    # 2. Match general aliases and canonical names with word boundary checks
    # Sort terms by length descending to match multi-word phrases first (e.g. "React Native" before "React")
    sorted_terms = sorted(ALL_SEARCH_TERMS.keys(), key=len, reverse=True)

    for term in sorted_terms:
        if term in SPECIAL_PATTERNS:
            continue
        canonical = ALL_SEARCH_TERMS[term]
        if canonical in found_canonicals:
            continue
        
        # Word boundary safe pattern
        escaped = re.escape(term)
        pattern = r'\b' + escaped + r'\b'
        matches = list(re.finditer(pattern, text, re.IGNORECASE))
        if matches:
            found_canonicals.add(canonical)
            cat = get_skill_category(canonical)
            target_cat = cat if cat in results else CATEGORY_TOOLS
            match_span = matches[0].span()
            start = max(0, match_span[0] - 25)
            end = min(len(text), match_span[1] + 25)
            evidence = text[start:end].replace('\n', ' ').strip()
            results[target_cat].append((canonical, evidence, 0.95))

    return results
