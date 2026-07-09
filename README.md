JobSpark — AI-Powered Job Portal

JobSpark is a full-stack job portal that connects candidates and recruiters, with an AI-driven resume-matching engine at its core. Recruiters post jobs and get candidates automatically ranked by fit; candidates get a match/strength score on their resume, real-time notifications, and tools to manage multiple resume versions.


1. What this project is

A two-sided job marketplace, similar in spirit to LinkedIn Jobs / Naukri, split into two codebases:

PartTechFolderFrontendReact 19 (Create React App)jobspark_frontend/BackendNode.js + Expressjobspark_backend/

The standout feature is the AI Matching Service — a custom NLP engine (no external AI API/key needed) that parses resumes, extracts skills, and scores candidates against job descriptions.

2. Why this project (problem it solves)


Recruiters get flooded with unfiltered applications and have to manually screen resumes for skill fit.
Candidates don't know how well their resume matches a job, or how to improve it, before applying.
Most portals don't let candidates keep multiple tailored resume versions (e.g., "React-focused" vs "Backend-focused").


JobSpark addresses this by automatically scoring and ranking applications, giving candidates a resume-strength score, and supporting resume versioning — reducing manual screening effort for recruiters and giving candidates actionable feedback.

3. Core Features

Candidate side


Register/login, browse and search jobs (with autocomplete + boolean search like react AND node NOT intern)
Apply to jobs, track application status in real time (Socket.io)
Upload resume (PDF/DOC), get an automatic resume strength score and parsed skills
Maintain multiple resume versions with labels (e.g. "ML Engineer v2")
In-app notifications (application status, shortlisting, interview, offer)


Recruiter side


Company profile management (multi-tenant — one company, multiple recruiter accounts)
Post/edit/delete jobs
View applicants ranked by AI match score, compare candidates side-by-side
Analytics dashboard: platform stats, most-applied jobs, skill-gap analysis (skills in demand vs. skills candidates have)


Platform-wide


JWT authentication with role-based access (candidate / recruiter)
Redis caching for hot endpoints (job listings, trending jobs) — gracefully disabled if Redis isn't running
Real-time updates via Socket.io
Rate limiting, Helmet security headers, gzip compression, Winston logging


4. The AI Matching Engine (services/aiMatchingService.js)

Built with natural and compromise (pure NLP libraries — no OpenAI/external API key required):


TF-IDF + Cosine Similarity — resume vs. job description text similarity
Skill Taxonomy & Normalization — treats "JS", "React.js", "ReactJS" as the same skill
Semantic Expansion — synonym graph for related skills
Fuzzy Matching — Jaro-Winkler distance for typo-tolerant skill matching
Boolean Search Parser — AND / OR / NOT queries over job listings
Collaborative Filtering — "jobs similar candidates applied to"
Trending Score — jobs weighted by recent application velocity
Resume Strength Score — a 0–100 composite score based on multiple resume factors


5. Architecture

┌──────────────────┐        REST + Socket.io        ┌────────────────────┐
│  React Frontend  │ ◄─────────────────────────────► │   Express Backend   │
│  (CRA, port 3000)│                                  │   (port 5000)       │
└──────────────────┘                                  └────────┬───────────┘
                                                                │
                                        ┌───────────────────────┼───────────────────────┐
                                        ▼                       ▼                       ▼
                                 ┌─────────────┐        ┌──────────────┐        ┌──────────────┐
                                 │   MongoDB    │        │    MySQL     │        │    Redis     │
                                 │ (Mongoose)   │        │ (Sequelize)  │        │  (optional    │
                                 │ Users,       │        │ Jobs,        │        │   caching)    │
                                 │ Notifications│        │ Applications │        │               │
                                 │ ResumeVersion│        │              │        │               │
                                 │ Company      │        │              │        │               │
                                 └─────────────┘        └──────────────┘        └──────────────┘

Why two databases? This is a deliberate hybrid design:


MongoDB stores flexible/document-style data: Users, Notifications, Company profiles, Resume versions (with nested parsedData).
MySQL (Sequelize) stores relational/structured data: Jobs and Applications, which benefit from strict schema, joins, and transactional integrity.


6. Tech Stack

Backend


Express 4, Mongoose 7 (MongoDB), Sequelize 6 (MySQL), JWT, bcryptjs
natural + compromise — NLP for resume/job matching
pdf-parse — resume text extraction, multer — file uploads
socket.io — real-time notifications, redis — optional caching
winston + morgan — logging, helmet + express-rate-limit — security


Frontend


React 19, React Router 7, React Query (react-query)
Axios, socket.io-client
react-hot-toast, react-select, react-dropzone, recharts (analytics charts)
Tailwind-style utility classes / Headless UI components
date-fns


7. Project Structure

jobspark_backend/
├── config/         # mongo.js, mysql.js — DB connections
├── controllers/     # auth, jobs, applications, analytics
├── middleware/       # auth (JWT), cache (Redis)
├── models/            # User, Company, Notification, ResumeVersion (Mongo)
│                       # Job, Application (MySQL/Sequelize)
├── routes/            # one file per resource
├── services/          # aiMatchingService, resumeService, emailService, notificationService
├── utils/logger.js
├── uploads/           # resumes, avatars (multer storage)
└── server.js          # app entry point

jobspark_frontend/
├── src/
│   ├── pages/          # Home, JobsList, JobDetail, Login, Register,
│   │                     CandidateDashboard, RecruiterDashboard, PostJob,
│   │                     EditJob, ApplicationsPage, JobApplicationsPage,
│   │                     CandidateComparePage, AnalyticsPage, ProfilePage,
│   │                     RecruiterProfilePage, ResumeScorePage, ResumeVersionsPage
│   ├── components/shared/  # Navbar, NotificationBell, SmartSearchBar, Spinner, BackButton
│   ├── context/          # AuthContext, ThemeContext
│   ├── hooks/             # useDebounce, useNotifications, useSocket
│   └── services/api.js    # Axios instance / API calls

8. API Overview

All routes are prefixed with /api.

ResourceRoute baseNotesAuth/api/authregister, login, /me, update profile, change passwordJobs/api/jobslist (cached), trending, autocomplete, boolean-search, CRUD (recruiter only)Applications/api/applicationsapply, list, update statusResume/api/resumeupload + parse resumeResume Versions/api/resume-versionscandidate-only, manage multiple resume versionsAnalytics/api/analyticsplatform stats, most-applied jobs, skill-gap analysisRecruiter/api/recruiterrecruiter-specific dataCandidate/api/candidatepublic candidate profileCompany/api/companycompany profile (multi-tenant)Notifications/api/notificationslist, mark read, clearHealth/api/healthuptime check

Authenticated routes require Authorization: Bearer <JWT>.

9. Getting Started

Prerequisites


Node.js (v16+ recommended)
MongoDB running locally or a connection URI
MySQL running locally or a connection URI
(Optional) Redis — the app runs fine without it, just without caching


Backend setup

bashcd jobspark_backend
npm install
cp .env.example .env   # then fill in your own values
npm run dev            # nodemon, runs on http://localhost:5000

.env variables needed:

PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/jobportal

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=jobportal
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:3000

⚠️ Note: the .env.example in this repo currently has real-looking email/password values committed. Replace them with your own credentials and make sure .env is git-ignored before pushing anywhere public.

Frontend setup

bashcd jobspark_frontend
npm install
npm start   # runs on http://localhost:3000, proxies API calls to :5000

10. Known Gaps / Things To Improve


.env.example contains what look like real credentials — rotate/remove them.
.doc/.docx resume parsing currently just reads raw bytes as text (works for .pdf via pdf-parse, but not properly for Word files — the code even leaves a comment suggesting mammoth for this).
No automated test suite currently included for either frontend or backend.
logs/ folder (Winston output) is currently bundled in the zip — should be git-ignored.
Consider adding API documentation (e.g. Swagger) since there are ~10 route groups.