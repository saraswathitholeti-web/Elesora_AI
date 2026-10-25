# ELEYSORA AI
### Beyond the Screen. Beyond Every Barrier.
**Intelligence for Everyone. Opportunities for All.**
*Where Intelligence Meets Inclusion.*

---

## Competition Information
- **Theme:** Theme 3 — Beyond the Screen: Build for a Smarter, More Inclusive Future
- **Category:** AI-Powered Social Impact, Accessibility, Education, Career Development, and Digital Inclusion Platform
- **Application Type:** Full-Stack, AI-Powered, Responsive Web Application

---

## Project Overview

**ELEYSORA AI** is an intelligent digital inclusion and opportunity empowerment platform designed to eliminate barriers preventing students, rural communities, job seekers, and differently-abled individuals from accessing high-value digital opportunities.

### Central Flywheel
```
DISCOVER  ──────►  UNDERSTAND  ──────►  PLAN  ──────►  ACT  ──────►  TRACK
Find verified      Demystify dense     Generate        Convert into   Monitor
scholarships,      circulars via       personalized    Smart Action   milestones &
jobs & schemes     multilingual AI     LifePath        Cards with     deadlines in
in India           (EN, TE, HI)        roadmaps        deadlines      Dashboard
```

---

## Core Feature Matrix

1. **ELEYSORA LifePath (Signature Feature):** Personalized AI career roadmap generator tailored to your education level, current skills, weekly study hours, and resource budget. Generates milestone stages, recommended open resources, and hands-on capstone projects with celebratory completion tracking.
2. **Opportunity Discovery & TrustLens:** Curated database of verified scholarships (NSP, Google APAC, etc.), virtual internships (GSoC, AICTE), free courses (SWAYAM, Coursera Financial Aid), and certifications with deterministic match scoring, skill gap identification, and verified primary source stamps.
3. **Multilingual AI Assistant:** Conversational guidance powered by Google Gemini API in **English, Telugu (తెలుగు), and Hindi (हिंदी)** with speech-to-text dictation, text-to-speech audio playback, copy shortcuts, and persistent chat history.
4. **Document Intelligence Engine:** Drag-and-drop parsing for PDF, DOCX, TXT, and image circulars. Automatically extracts submission deadlines, eligibility thresholds, required certificates, and warnings, offering contextual Q&A against document text.
5. **Barrier-to-Bridge Solver:** Diagnoses reported real-world obstacles (financial hardship, language friction, disability, device constraints) and formulates concrete bridge solutions, open-access resources, and converted actionable tasks.
6. **Smart Action Cards:** Dynamic personal task board with status tracking (*Not Started*, *In Progress*, *Completed*), deadlines, and priorities.
7. **Government Scheme Finder:** Searchable directory of verified Indian government welfare programs (NSP, PMKVY 4.0, SWAYAM, Bhashini) with verified eligibility criteria and direct application links.
8. **Smart Learning Hub:** Explains complex technical topics using intuitive real-life analogies, followed by interactive 3-question assessments with instant grading and explanations.
9. **Community Connect:** Source-verified network of accessibility foundations, disability advocacy centers, and open digital literacy organizations across India.
10. **Sustainability Assistant:** Practical, zero-cost daily conservation guidance for energy, water, recycling, and sustainable commuting.
11. **Accessibility Center (WCAG 2.2 AA):** High-contrast mode, typography scaling (90% to 130%), reduced-motion enforcement, simplified reading mode, visible keyboard focus indicators, and text-to-speech synthesis.
12. **Personal Dashboard:** Aggregates active LifePath progress, saved bookmarks, upcoming verified deadlines, pending tasks, recent activity, and customized AI recommendations.

---

## Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Vanilla CSS + Tailwind CSS (Brand palette: Electric Purple `#8B5CF6`, Neon Cyan `#22D3EE`, Dark Glass `#080B1A` / `#13152B`)
- **Navigation:** React Router v7
- **Icons & Visuals:** Lucide React, Canvas Confetti
- **State & Data Fetching:** TanStack React Query, Native React Contexts

### Backend
- **Framework:** Python 3.12+ / FastAPI
- **ASGI Server:** Uvicorn
- **ORM & Data:** SQLAlchemy 2.x (Asyncio engine with SQLite / PostgreSQL support)
- **Document Processing:** PyMuPDF (fitz), python-docx
- **Authentication:** JWT Bearer Token / Supabase Auth Bridge with PostgreSQL Row Level Security (RLS)
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`) via official Google Gen AI SDK + contextual zero-failure fallback engine

---

## Folder Structure

```text
Elesora_AI/
│
├── frontend/                     # React + TypeScript + Vite Frontend
│   ├── public/                   # Public assets & SVG logo
│   ├── src/
│   │   ├── components/           # Reusable UI & Layouts
│   │   │   ├── common/           # TrustBadge, etc.
│   │   │   └── layout/           # Navbar, Footer, DashboardLayout
│   │   ├── contexts/             # AuthContext, AccessibilityContext
│   │   ├── pages/                # All 20 application routes
│   │   ├── services/             # Centralized ApiClient
│   │   ├── types/                # TypeScript interfaces
│   │   ├── index.css             # Design tokens & glassmorphism utilities
│   │   ├── App.tsx               # Route configurations
│   │   └── main.tsx              # React DOM entrypoint
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                      # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint, CORS, startup seed
│   │   ├── core/                 # Config, Database, Security, Exceptions, Seed
│   │   ├── api/                  # All 13 feature routers
│   │   ├── models/               # SQLAlchemy models (15 database tables)
│   │   ├── schemas/              # Pydantic v2 validation models
│   │   ├── services/             # Gemini AI, Document OCR, Matcher
│   │   └── dependencies/         # Auth & user resolution
│   ├── tests/                    # Pytest test suite (9 comprehensive tests)
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/                     # Supabase & PostgreSQL Architecture
│   ├── migrations/               # Initial SQL table definitions
│   ├── policies/                 # Row Level Security (RLS) SQL policies
│   └── README.md
│
├── README.md
└── .gitignore
```

---

## Local Setup & Quick Start

### 1. Prerequisites
- Node.js (v18+) and npm
- Python (3.10+)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
py -m pip install -r requirements.txt greenlet email-validator

# Run automated test suite
py -m pytest tests -v

# Start FastAPI server (runs on http://localhost:8000)
py -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation is available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
# In another terminal, navigate to frontend directory
cd frontend

# Install dependencies (already installed during setup)
npm install

# Run Vite development server (runs on http://localhost:5173)
npm run dev

# Or compile production bundle
npm run build
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
APP_NAME="ELEYSORA AI"
APP_ENV=development
API_V1_PREFIX=/api/v1
PORT=8000
HOST=0.0.0.0

# Database URL: Supports SQLite for zero-config local dev or Supabase PostgreSQL
DATABASE_URL=sqlite+aiosqlite:///./eleysora.db

# Supabase PostgreSQL (Optional for local dev, active in production)
# DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@[HOST]:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Testing & Quality Assurance

### Automated Backend Tests
Run the test suite covering authentication, RLS user isolation, opportunity matching, document extraction, barrier resolution, and learning hub quizzes:
```bash
py -m pytest backend/tests -v
```
**Status: 9 Passed out of 9 tests.**

---

## Deployment Configuration

- **Frontend:** Configured for Vercel / Netlify (`npm run build` output in `frontend/dist`).
- **Backend:** Configured for Render / Railway / Google Cloud Run via included `backend/Dockerfile`.
- **Database:** Supabase PostgreSQL with `database/migrations/01_initial_schema.sql` and `database/policies/rls_policies.sql`.

---

## Demonstration Quality & Scenario Walkthrough

### Scenario: A Rural B.Tech Student Overcoming Barriers
1. **Discover:** The student opens ELEYSORA AI and explores verified scholarships and internships.
2. **Barrier-to-Bridge:** They state: *"I want to become an AI engineer, but I cannot afford expensive bootcamps."* The AI diagnoses the financial obstacle, recommends Coursera Financial Aid and SWAYAM, and creates immediate Smart Action Cards.
3. **LifePath:** Generates a custom 4-stage learning timeline tailored to 7 hours of weekly study.
4. **Document Intelligence:** Uploads an official scholarship notification; ELEYSORA summarizes required eligibility proofs, flags deadlines, and provides explanations in Telugu.
5. **Action & Track:** The student checks off completed tasks on their Action Card board; the Dashboard updates in real time with progress and upcoming verified dates.
