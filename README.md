# TRINETRA

### ML-Based Bug-Proneness and Technical Debt Hotspot Predictor

TRINETRA is a developer-facing software analytics system that analyzes a public GitHub repository and predicts which source files are relatively more likely to require attention.

It combines Git-history metrics and source-code metrics with a machine-learning model to produce file-level risk scores. These scores help developers prioritize testing, code review, debugging, and refactoring.

> **TRINETRA predicts risk; it does not prove that a file contains a bug.**

---

## 1. Problem Statement

Large software repositories contain many files, but developers cannot manually inspect every file with the same level of attention.

Some files are changed frequently, have high code complexity, experience significant code churn, or have a history associated with bug-fix activity.

TRINETRA uses these measurable characteristics to identify files that deserve higher attention.

The system focuses on:

- Repository change history
- Code complexity
- Code size
- Developer activity
- Code churn
- Bug-fix activity
- Recency of changes
- File age

The result is a file-level risk-prioritization system.

---

## 2. What TRINETRA Does

The Semester 5 implementation supports the following flow:

```text
Public GitHub Repository
        ↓
Repository Acquisition
        ↓
Git History Analysis
        ↓
Python Source-Code Analysis
        ↓
Feature Engineering
        ↓
ML Risk Prediction
        ↓
FastAPI Backend
        ↓
Next.js Dashboard
        ↓
File-Level Risk Analysis
```

A user provides a public GitHub repository URL.

TRINETRA analyzes the repository and produces:

- Repository-level summary
- File-level risk scores
- Risk categories
- Risk distribution
- File metrics
- Risk factors
- File-level drill-down information

---

## 3. Semester 5 Scope

The current Semester 5 implementation focuses on:

- Public GitHub repositories
- Python source files
- Git history
- File-level analysis
- Machine-learning-based risk prediction
- FastAPI backend
- Next.js frontend
- File-level dashboard
- Basic explainability
- Automated testing

The system is intentionally designed as a focused academic MVP rather than a complete commercial developer platform.

---

## 4. Risk Interpretation

TRINETRA assigns every analyzed file a risk score from 0 to 100.

Current presentation bands are:

| Score | Risk Level |
|------:|------------|
| 0–39 | Low |
| 40–69 | Medium |
| 70–89 | High |
| 90–100 | Critical |

These thresholds are presentation bands used to prioritize files. They should not be interpreted as universally calibrated probabilities of bugs.

---

## 5. Features Used

TRINETRA currently uses 11 file-level features:

1. `commit_count`
2. `author_count`
3. `lines_added`
4. `lines_deleted`
5. `total_churn`
6. `loc`
7. `complexity`
8. `file_age_days`
9. `days_since_last_change`
10. `recent_commit_count`
11. `bug_fix_count`

These features combine source-code characteristics and repository history.

---

## 6. Bug-Fix Heuristic

TRINETRA does not have access to a perfect ground-truth bug database.

Instead, likely bug-fix commits are identified using commit-message keywords such as:

- `fix`
- `bug`
- `bugfix`
- `hotfix`
- `defect`
- `patch`
- `regression`
- `crash`
- `error`
- `issue`

Common non-bug changes such as the following are excluded:

- `typo`
- `spelling`
- `grammar`
- `whitespace`
- `formatting`
- `lint`

This is a heuristic proxy for historical bug-fix activity.

Therefore, the resulting labels should not be interpreted as perfect bug ground truth.

---

## 7. Time-Aware Dataset Construction

TRINETRA uses time-aware feature and label generation.

At a historical snapshot `T`:

```text
Features
    ↓
Only information available at T
```

The label is generated using future information:

```text
T
│
├── Features available at T
│
└── Future window
       ↓
   Bug-fix activity
```

The current future-label window is 180 days.

This design helps prevent target leakage.

### Target Leakage

Target leakage occurs when information from the future is accidentally included in the features used to make a prediction.

TRINETRA avoids this by ensuring that prediction features come from information available at the snapshot time, while future bug-fix activity is used only for label generation.

---

## 8. Machine Learning

The current saved baseline model is Logistic Regression.

The preprocessing pipeline includes:

```text
Raw Features
      ↓
log1p Transformation
      ↓
StandardScaler
      ↓
Logistic Regression
      ↓
Probability
      ↓
Risk Score
```

The Logistic Regression model uses balanced class weights because the dataset contains substantially fewer positive examples than negative examples.

Random Forest is also evaluated as a comparison model.

---

## 9. Evaluation

The current dataset contains:

- 4,191 file-snapshot observations
- 377 positive labels
- 8 repositories

Repository-aware holdout testing is used.

Training repositories:

- `psf/requests`
- `pallets/flask`
- `pallets/click`
- `pallets/jinja`
- `encode/httpx`
- `Textualize/rich`

Held-out repositories:

- `pallets/werkzeug`
- `encode/starlette`

### Logistic Regression

| Metric | Result |
|---|---:|
| Precision | 0.1211 |
| Recall | 0.8333 |
| F1 | 0.2115 |
| Accuracy | 0.6664 |
| ROC-AUC | 0.8041 |

### Random Forest

| Metric | Result |
|---|---:|
| Precision | 0.1456 |
| Recall | 0.5758 |
| F1 | 0.2324 |
| Accuracy | 0.7958 |
| ROC-AUC | 0.8036 |

Accuracy is not used as the primary success measure because the dataset is imbalanced.

---

## 10. Explainability

TRINETRA provides basic model-factor explanations.

For each file, the system can display:

- Feature values
- Important model factors
- Risk score
- Risk category

The system does **not** claim that a particular feature directly caused a bug.

Advanced explainability methods such as SHAP are outside the current Semester 5 scope.

---

## 11. Example Analysis

The current demonstration repository is:

```text
pallets/itsdangerous
```

Example repository results:

- Python files: 15
- Average risk: 27.0
- Critical: 0
- High: 0
- Medium: 5
- Low: 10

Example:

```text
src/itsdangerous/serializer.py

Risk Score: 63.0
Risk Level: Medium

LOC: 224
Complexity: 44
Commits: 26
Authors: 4
Total Churn: 894
```

The example demonstrates how TRINETRA combines multiple signals rather than relying on a single metric.

---

## 12. Backend

The backend is implemented using:

- Python
- FastAPI
- GitPython
- Radon
- scikit-learn
- pytest

Main responsibilities:

- Validate repository URLs
- Clone public repositories
- Analyze Git history
- Analyze Python source files
- Generate features
- Generate datasets
- Load the trained model
- Predict file-level risk
- Store analysis results for the current analysis workflow
- Expose REST APIs

---

## 13. Frontend

The frontend is implemented using:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React

Main UI flow:

```text
Landing Page
      ↓
GitHub Repository URL
      ↓
Analysis Progress
      ↓
Dashboard
      ↓
File-Level Analysis
      ↓
File Details
```

The frontend communicates with the FastAPI backend through REST APIs.

---

## 14. API Endpoints

### Health

```http
GET /health
```

### Start Analysis

```http
POST /api/v1/analyze
```

Request:

```json
{
  "repoUrl": "https://github.com/owner/repository"
}
```

### Job Status

```http
GET /api/v1/jobs/{job_id}
```

### Repository Summary

```http
GET /api/v1/repositories/summary?jobId={job_id}
```

### File List

```http
GET /api/v1/repositories/files?jobId={job_id}
```

### File Details

```http
GET /api/v1/files/detail?jobId={job_id}&path={file_path}
```

---

## 15. Project Structure

```text
TRINETRA/
│
├── backend/
│   ├── app/
│   │   ├── config.py
│   │   ├── main.py
│   │   └── services/
│   │       ├── repository_service.py
│   │       ├── git_service.py
│   │       ├── complexity_service.py
│   │       ├── bugfix_service.py
│   │       ├── feature_service.py
│   │       ├── prediction_service.py
│   │       └── analysis_service.py
│   │
│   ├── ml/
│   │   └── training/
│   │       ├── build_dataset.py
│   │       ├── train.py
│   │       └── repos.py
│   │
│   ├── tests/
│   └── README.md
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── data/
├── docs/
├── .gitignore
└── README.md
```

---

## 16. Security Considerations

TRINETRA analyzes repositories as data.

The application does not execute the analyzed repository's application code.

The backend:

- Validates GitHub repository URLs
- Uses temporary repository directories
- Cleans temporary clones
- Disables interactive Git prompts
- Uses timeouts
- Validates file paths
- Does not expose internal exception details
- Keeps secrets in environment variables

The current Semester 5 implementation supports public repositories.

Private repositories and GitHub OAuth are future scope.

---

## 17. Testing

The backend test suite covers areas including:

- GitHub URL validation
- Bug-fix heuristic
- Complexity calculation
- Temporal label generation
- Target leakage prevention
- Prediction without labels
- API validation
- Controlled temporal Git-history scenarios

The project also includes end-to-end testing of the main analysis flow.

---

## 18. Current Limitations

The Semester 5 version has several deliberate limitations:

- Public GitHub repositories only
- Python source files
- Heuristic bug-fix labels
- Limited dataset size
- Baseline ML models
- No private repository authentication
- No GitHub OAuth
- No persistent user account system
- No advanced explainability such as SHAP
- No multi-language analysis
- No GitHub App / CI integration

These limitations define the boundary of the current academic MVP.

---

## 19. Future Scope

Potential Semester 6 extensions include:

- GitHub OAuth
- Private repository support
- User authentication
- Persistent analysis history
- PostgreSQL
- Improved ML models
- SHAP-based explainability
- Multi-language source analysis
- GitHub App integration
- CI/CD integration
- Automated repository monitoring
- Larger cross-project datasets
- Cloud deployment

---

## 20. Project Principle

> **TRINETRA does not tell developers where a bug is. It tells them where they should look first.**
