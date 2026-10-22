# TRINETRA Frontend

The TRINETRA frontend is the developer-facing web interface for submitting a GitHub repository and visualizing the resulting file-level risk analysis.

The frontend is responsible for presentation and user interaction. Repository cloning, Git analysis, feature extraction, machine-learning prediction, and analysis orchestration are handled by the FastAPI backend.

---

## 1. Technology Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Recharts
- Lucide React

---

## 2. User Flow

The Semester 5 frontend follows this flow:

```text
Landing Page
      ↓
Enter Public GitHub URL
      ↓
Start Analysis
      ↓
Analysis Progress
      ↓
Repository Dashboard
      ↓
File Risk Table
      ↓
File Details
```

The frontend does not implement user accounts, GitHub OAuth, repository history, or settings in the current Semester 5 scope.

---

## 3. Main UI Sections

### Landing Page

Provides:

- TRINETRA introduction
- Project purpose
- Workflow explanation
- GitHub repository input
- Sample/demo repository information
- Preview of the dashboard

### Analysis Progress

Displays the status of the backend analysis job while the repository is being processed.

### Dashboard

Displays:

- Total files
- Average risk
- Risk distribution
- Risk visualization
- File-level risk table
- Search and filtering
- Sorting

### File Details

Provides detailed information for a selected file, including:

- Risk score
- Risk category
- Lines of code
- Complexity
- Commit count
- Contributors
- Churn
- Bug-fix activity
- File age
- Recent changes
- Risk factors

---

## 4. Backend Integration

The frontend communicates with the FastAPI backend through REST APIs.

Main flow:

```text
Frontend
   │
   │ POST /api/v1/analyze
   ↓
FastAPI
   │
   ├── Repository Analysis
   ├── Git History
   ├── Feature Extraction
   └── ML Prediction
   │
   ↓
Job Result
   │
   ↓
Frontend
```

The frontend polls the analysis job status while the backend performs the analysis.

---

## 5. API Endpoints Used

```text
POST /api/v1/analyze
GET  /api/v1/jobs/{job_id}
GET  /api/v1/repositories/summary
GET  /api/v1/repositories/files
GET  /api/v1/files/detail
```

The API integration is centralized in the frontend data layer.

---

## 6. Frontend Data Mapping

The backend returns the actual TRINETRA analysis schema.

The frontend maps backend fields into the UI data model rather than changing the backend API simply to match UI components.

Examples:

```text
Backend riskScore
        ↓
Frontend riskScore

Backend riskCategory
        ↓
Frontend riskLevel

Backend metrics.loc
        ↓
Frontend linesOfCode

Backend metrics.complexity
        ↓
Frontend complexity

Backend metrics.commit_count
        ↓
Frontend commits
```

---

## 7. Running the Frontend

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend is normally available at:

```text
http://localhost:3000
```

---

## 8. Backend URL

The frontend requires the FastAPI backend to be running.

Configure the backend API URL using the project's environment configuration.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Use the variable name expected by the current `src/lib/api.ts` implementation if it differs.

---

## 9. Important Directories

```text
frontend/
│
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   └── ...
│   │
│   ├── components/
│   │   ├── Navbar
│   │   ├── Sidebar
│   │   ├── RiskTable
│   │   ├── RiskHeatmap
│   │   ├── RiskDistribution
│   │   ├── FileRiskFactors
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   └── mockData.ts
│   │
│   └── types/
│
├── public/
├── src/app/favicon.ico
├── package.json
└── README.md
```

---

## 10. Frontend Principle

The frontend is a visualization and interaction layer for the TRINETRA analysis engine.

It should display actual backend analysis results rather than relying on fabricated repository or risk data.
