<div align="center">

# ⚡ SwipeX

### AI-Powered Swipe-Based Job Discovery Platform

*Discover your dream job with a single swipe.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

</div>

---

## 🎯 Overview

SwipeX reimagines job discovery with a Tinder-like swipe interface powered by AI. Instead of browsing endless listings, users discover personalized job opportunities by swiping through beautiful, information-rich job cards.

**Key Differentiators:**
- 🃏 **Swipe-Based Discovery** — Intuitive card-based job browsing
- 🤖 **AI-Powered Matching** — Personalized recommendations that learn from your behavior
- 📊 **ATS Analysis** — Instant resume compatibility scoring
- 🎯 **Smart Filters** — Find exactly what you're looking for
- 📈 **Career Analytics** — Track your progress and identify skill gaps

---

## 🏗️ Architecture

```
swipex/
├── apps/
│   ├── frontend/          → Next.js 15 (App Router, TailwindCSS, ShadCN)
│   └── backend/           → FastAPI (SQLAlchemy, PostgreSQL, Redis)
├── packages/
│   ├── ui/                → Shared UI components
│   ├── types/             → Shared TypeScript types
│   ├── utils/             → Utility functions
│   ├── config/            → Shared configuration
│   ├── hooks/             → Custom React hooks
│   ├── api/               → API client library
│   └── shared/            → Shared constants & animations
├── docs/                  → Documentation
├── scripts/               → Development & deployment scripts
├── docker-compose.yml     → Container orchestration
└── turbo.json             → Monorepo pipeline
```

### Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15, TypeScript, TailwindCSS, ShadCN UI, Framer Motion, React Query, Zustand |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy 2.0, Alembic, Pydantic v2 |
| **Database** | PostgreSQL 16, Redis 7 |
| **AI/ML** | OpenAI API, Sentence Transformers, spaCy, Scikit-Learn |
| **Auth** | JWT (access + refresh tokens), Google OAuth 2.0, bcrypt |
| **DevOps** | Docker, Docker Compose, Turborepo, GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.0
- **Python** ≥ 3.11
- **Docker** & Docker Compose
- **npm** ≥ 10.0

### 1. Clone & Install

```bash
git clone https://github.com/your-org/swipex.git
cd swipex

# Install frontend dependencies
npm install

# Install backend dependencies
cd apps/backend
pip install -r requirements.txt
```

### 2. Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Edit with your values
# Required: DATABASE_URL, JWT_SECRET_KEY
# Optional: OPENAI_API_KEY, GOOGLE_CLIENT_ID
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL + Redis via Docker
docker-compose up -d db redis

# Run database migrations
cd apps/backend
alembic upgrade head

# (Optional) Seed with sample data
python seed_data.py
```

### 4. Run Development Servers

```bash
# Terminal 1: Frontend (port 3000)
npm run dev:frontend

# Terminal 2: Backend (port 8000)
npm run dev:backend
```

Visit **http://localhost:3000** to see SwipeX! 🎉

---

## 📦 Project Structure

### Frontend (`apps/frontend/`)

```
src/
├── app/                   → App Router pages
│   ├── (auth)/            → Auth pages (login, signup)
│   ├── (dashboard)/       → Protected dashboard pages
│   ├── (marketing)/       → Public pages
│   ├── layout.tsx         → Root layout
│   └── page.tsx           → Landing page
├── components/            → React components
│   ├── providers/         → Context providers
│   ├── ui/                → ShadCN UI components
│   └── shared/            → Shared components
├── stores/                → Zustand stores
├── hooks/                 → Custom hooks
└── lib/                   → Utilities
```

### Backend (`apps/backend/`)

```
app/
├── api/v1/               → Route handlers
├── core/                  → Config, security, database
├── models/                → SQLAlchemy ORM models
├── schemas/               → Pydantic validation schemas
├── services/              → Business logic
├── repositories/          → Data access layer
├── ai/                    → AI/ML modules
└── main.py                → FastAPI application
```

---

## 🔐 Authentication

SwipeX implements a secure, production-grade authentication system:

- **JWT Access Tokens** (15min expiry) via `Authorization: Bearer` header
- **Refresh Tokens** (7 day expiry) with automatic rotation
- **Google OAuth 2.0** social login
- **bcrypt** password hashing
- **Role-Based Access Control** (Admin, Recruiter, Job Seeker)

---

## 🗄️ Database Schema

Key tables:
- `users` — Authentication & role management
- `profiles` — Extended user information
- `companies` — Employer profiles
- `jobs` — Job listings
- `applications` — Job applications
- `saved_jobs` — Bookmarked jobs
- `swipes` — Swipe history for recommendations
- `recommendations` — AI-generated suggestions
- `resumes` — Parsed resume data + ATS scores
- `notifications` — User notifications
- `audit_logs` — Activity tracking

---

## 🧪 Testing

```bash
# Backend tests
cd apps/backend && python -m pytest tests/ -v

# Frontend type check
cd apps/frontend && npx tsc --noEmit

# Lint
npm run lint
```

---

## 🐳 Docker

```bash
# Build and run everything
docker-compose up --build

# Services:
# - Frontend:  http://localhost:3000
# - Backend:   http://localhost:8000
# - PostgreSQL: localhost:5432
# - Redis:      localhost:6379
```

---

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🗺️ Roadmap

- [x] **Milestone 1** — Foundation, Auth, Landing Page, Dashboard
- [x] **Milestone 2** — Swipe System, Job Feed, Search, Recommendations
- [ ] **Milestone 3** — Recruiter Dashboard, Job Posting, Applicant Management
- [ ] **Milestone 4** — Real-time Notifications, WebSocket Chat
- [ ] **Milestone 5** — Mobile App (React Native), Advanced Analytics

---

## 📄 License

This project is proprietary. All rights reserved.

---

<div align="center">
  <strong>Built with ❤️ by the SwipeX team</strong>
</div>
