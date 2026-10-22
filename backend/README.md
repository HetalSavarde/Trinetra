# TRINETRA Backend

The TRINETRA backend is the analysis and machine-learning engine of the system.

It accepts a public GitHub repository URL, analyzes its Git history and Python source files, extracts file-level features, applies the trained machine-learning model, and exposes the results through a FastAPI REST API.

---

## 1. Technology Stack

- Python
- FastAPI
- GitPython
- Radon
- scikit-learn
- pytest
- Pydantic

---

## 2. Backend Architecture

```text
GitHub Repository URL
        ↓
Repository Service
        ↓
Temporary Clone
        ↓
Git Service
        ↓
Source / History Analysis
        ↓
Feature Service
        ↓
ML Prediction Service
        ↓
Analysis Service
        ↓
FastAPI API
```

---

## 3. Main Components

### `app/main.py`

Main FastAPI application.

Responsibilities include:

- Creating the FastAPI application
- Registering API routes
- Configuring middleware
- CORS configuration
- Serving the dashboard where applicable

### `app/config.py`

Central configuration for:

- Feature ordering
- Time windows
- Risk bands
- Repository-analysis configuration
- Bug-fix patterns
- Data/model paths

### `app/services/repository_service.py`

Responsible for:

- Validating GitHub repository URLs
- Cloning public repositories
- Managing temporary repository directories
- Cleaning up repository clones

### `app/services/git_service.py`

Responsible for Git-history analysis.

It extracts information such as:

- Commits
- Authors
- File changes
- Lines added
- Lines deleted
- File age
- Last modification
- Recent commit activity
- Historical snapshots

### `app/services/complexity_service.py`

Responsible for source-code metrics.

The current implementation analyzes Python source code and calculates:

- Lines of code
- Cyclomatic complexity

Radon is used where possible, with fallback handling for files that cannot be processed normally.

### `app/services/bugfix_service.py`

Identifies likely bug-fix commits using commit-message heuristics.

Example keywords include:

```text
fix
bug
bugfix
hotfix
defect
patch
regression
crash
error
issue
```

Non-bug changes such as:

```text
typo
spelling
grammar
whitespace
formatting
lint
```

are excluded.

This is a proxy-labeling approach rather than ground-truth bug labeling.

### `app/services/feature_service.py`

Builds the time-aware file-level feature set and labels.

The current feature set contains 11 features:

```text
commit_count
author_count
lines_added
lines_deleted
total_churn
loc
complexity
file_age_days
days_since_last_change
recent_commit_count
bug_fix_count
```

### `app/services/prediction_service.py`

Responsible for:

- Loading the saved model
- Preparing inference features
- Generating predictions
- Calculating risk scores
- Assigning risk categories
- Generating basic factor explanations

Risk score:

```text
risk_score = predicted_probability × 100
```

### `app/services/analysis_service.py`

Coordinates the complete repository-analysis workflow.

It connects:

```text
Repository
    ↓
Git Analysis
    ↓
Source Analysis
    ↓
Feature Extraction
    ↓
Prediction
    ↓
Result Storage
```

---

## 4. Machine Learning Pipeline

The training pipeline is:

```text
Historical Repository Snapshots
            ↓
Feature Generation
            ↓
Future Bug-Fix Labels
            ↓
Dataset
            ↓
log1p Transformation
            ↓
StandardScaler
            ↓
Logistic Regression
            ↓
Evaluation
            ↓
Saved Model
```

The saved model can then be loaded independently for inference on a new repository.

---

## 5. Temporal Labeling

TRINETRA uses time-aware labeling.

For a snapshot at time `T`:

```text
Past / Current Information
        ↓
Feature Vector
```

The system then checks a future window:

```text
T + 180 days
```

If qualifying bug-fix activity affects the file during the future window, the file can receive a positive label.

This prevents future information from becoming part of the prediction features.

---

## 6. Target Leakage

Target leakage is a major concern in historical software prediction.

TRINETRA avoids leakage by separating:

```text
Feature Time
    ↓
Snapshot T

Label Time
    ↓
Future period after T
```

Features are constructed only from information available at the snapshot.

Future bug-fix activity is used for the label rather than the feature vector.

---

## 7. Dataset

The current training dataset contains:

```text
4,191 file-snapshot observations
377 positive labels
8 repositories
```

The dataset is constructed from multiple repositories to reduce dependence on a single codebase.

---

## 8. Repository-Aware Evaluation

The evaluation uses repository-aware holdout testing.

Training repositories:

```text
psf/requests
pallets/flask
pallets/click
pallets/jinja
encode/httpx
Textualize/rich
```

Held-out repositories:

```text
pallets/werkzeug
encode/starlette
```

This tests whether the model can generalize to repositories that were not used for training.

---

## 9. Model Results

### Logistic Regression

```text
Precision : 0.1211
Recall    : 0.8333
F1        : 0.2115
Accuracy  : 0.6664
ROC-AUC   : 0.8041
```

### Random Forest

```text
Precision : 0.1456
Recall    : 0.5758
F1        : 0.2324
Accuracy  : 0.7958
ROC-AUC   : 0.8036
```

The Logistic Regression model is used as the saved baseline because it provides an interpretable and relatively simple model for the current Semester 5 implementation.

---

## 10. Risk Bands

The backend maps prediction scores into presentation categories:

```text
90–100  Critical
70–89   High
40–69   Medium
0–39    Low
```

These are prioritization bands and should not be interpreted as calibrated probabilities.

---

## 11. API

### Health Check

```http
GET /health
```

### Start Repository Analysis

```http
POST /api/v1/analyze
```

Example request:

```json
{
  "repoUrl": "https://github.com/pallets/itsdangerous"
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
GET /api/v1/files/detail?jobId={job_id}&path={path}
```

---

## 12. Running the Backend

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI:

```bash
uvicorn app.main:app --reload
```

The backend will normally be available at:

```text
http://localhost:8000
```

---

## 13. Machine Learning Commands

Dataset generation:

```bash
python ml/training/build_dataset.py
```

Model training and evaluation:

```bash
python ml/training/train.py
```

The exact command-line options should be checked against the current script implementation.

The trained model is then loaded by the prediction service for inference.

---

## 14. Testing

Run the backend test suite with:

```bash
pytest
```

The tests cover areas including:

- Repository URL validation
- Bug-fix heuristic
- Complexity calculation
- Future-only label generation
- Target leakage prevention
- Prediction without labels
- API validation
- Temporal Git-history behavior

---

## 15. Security

The backend treats repositories as data to analyze.

It does not execute the application's code contained inside the analyzed repository.

Security measures include:

- GitHub URL validation
- Temporary repository directories
- Cleanup of cloned repositories
- Disabled Git terminal prompts
- Timeout handling
- File/path validation
- Environment-based secrets
- Internal error handling

The current Semester 5 version supports public repositories.

---

## 16. Analysis Storage

The backend generates JSON analysis results for the current analysis workflow.

These results are used by the frontend to retrieve repository and file-level analysis data.

This does not represent a permanent user-analysis history system.

Persistent analysis history and user accounts are outside the current Semester 5 scope.

---

## 17. Current Limitations

The backend currently focuses on:

- Public GitHub repositories
- Python source files
- Git-based features
- Heuristic bug-fix labels
- Baseline ML models
- File-level risk prediction

It does not currently provide:

- Private repository authentication
- GitHub OAuth
- Multi-language analysis
- SHAP explainability
- GitHub App integration
- CI/CD integration
- Persistent user accounts
- PostgreSQL-backed analysis history

---

## 18. Future Backend Scope

Potential future improvements include:

- Larger training datasets
- Improved labeling strategies
- More advanced ML models
- SHAP explainability
- Private repository support
- GitHub OAuth
- PostgreSQL persistence
- Multi-language source analysis
- GitHub App integration
- CI/CD integration
- Continuous repository monitoring
