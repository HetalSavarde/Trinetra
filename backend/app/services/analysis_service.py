"""Analysis Orchestrator: URL -> clone -> history -> features -> saved model -> result JSON.

Jobs run in a background task so the HTTP request never blocks on a long clone. State is kept
in memory plus a result file per job (prototype-level storage; a database is deferred).
"""
import json

import pandas as pd
import threading
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.config import RESULTS_DIR
from app.services import feature_service as fs
from app.services import git_service as gs
from app.services import prediction_service as ps
from app.services.repository_service import RepositoryError, parse_repo_url, temporary_clone

_JOBS: Dict[str, Dict[str, Any]] = {}
_LOCK = threading.Lock()
CATEGORIES = ["Critical", "High", "Medium", "Low"]


def create_job(repo_url: str) -> Dict[str, Any]:
    owner, repo = parse_repo_url(repo_url)  # raises RepositoryError on invalid input
    job = {
        "jobId": f"job_{uuid.uuid4().hex[:10]}",
        "repoName": f"{owner}/{repo}",
        "repoUrl": f"https://github.com/{owner}/{repo}",
        "status": "queued", "stage": "queued", "progress": 0, "error": None,
    }
    with _LOCK:
        _JOBS[job["jobId"]] = job
    return job


def _update(job_id: str, **kw) -> None:
    with _LOCK:
        _JOBS[job_id].update(kw)


def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    with _LOCK:
        j = _JOBS.get(job_id)
        return dict(j) if j else None


def run_job(job_id: str) -> None:
    job = get_job(job_id)
    try:
        _update(job_id, status="running", stage="cloning repository", progress=10)
        with temporary_clone(job["repoUrl"]) as repo:
            _update(job_id, stage="reading git history", progress=35)
            hist = gs.read_history(repo)
            if hist.empty:
                raise RepositoryError("No Python files with history were found in this repository.")
            head = gs.head_commit(repo)
            branch = gs.branch_name(repo)

            _update(job_id, stage="extracting file features", progress=55)
            sources = gs.read_python_sources(repo, head["sha"])
            feats = fs.build_snapshot_features(job["repoName"], hist, sources, head["ts"] + 1)
            if feats.empty:
                raise RepositoryError("No analyzable Python source files were found.")

            # Preserve real monthly activity for the frontend detail chart.
            activity_by_path = {}
            for path, group in hist.groupby("path"):
                rows = []
                grouped = group.copy()
                grouped["month"] = pd.to_datetime(grouped["ts"], unit="s", utc=True).dt.strftime("%Y-%m")
                for month, mg in grouped.groupby("month"):
                    rows.append({
                        "month": month,
                        "commits": int(mg["sha"].nunique()),
                        "bugFixes": int(mg.loc[mg["is_fix"], "sha"].nunique()),
                    })
                activity_by_path[path] = rows[-12:]

        _update(job_id, stage="predicting risk", progress=80)
        files = ps.predict_files(feats)
        for f in files:
            f["commitActivity"] = activity_by_path.get(f["filePath"], [])
        files.sort(key=lambda f: f["riskScore"], reverse=True)

        counts = {c: sum(1 for f in files if f["riskCategory"] == c) for c in CATEGORIES}
        analyzed_commits = int(hist["sha"].nunique())
        analyzed_contributors = int(hist["author"].nunique())
        analyzed_bugfix_commits = int(hist.loc[hist["is_fix"], "sha"].nunique())
        result = {
            "jobId": job_id,
            "repository": {
                "name": job["repoName"],
                "url": job["repoUrl"],
                "branch": branch,
                "analyzedCommit": head["sha"],
            },
            "analyzedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "model": ps.model_info(),
            "summary": {
                "totalFiles": len(files),
                "averageRiskScore": round(sum(f["riskScore"] for f in files) / len(files), 1),
                "categoryCounts": counts,
                "totalCommits": analyzed_commits,
                "totalContributors": analyzed_contributors,
                "totalBugFixCommits": analyzed_bugfix_commits,
                "languages": [{"name": "Python", "percentage": 100}],
            },
            "files": files,
            "notice": "Scores estimate relative maintenance/defect RISK from history and code metrics. "
                      "They do not prove a file contains a bug.",
        }
        RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        (RESULTS_DIR / f"{job_id}.json").write_text(json.dumps(result))
        _update(job_id, status="completed", stage="done", progress=100)
    except RepositoryError as e:
        _update(job_id, status="failed", stage="failed", error=str(e))
    except ps.ModelNotAvailable as e:
        _update(job_id, status="failed", stage="failed", error=str(e))
    except Exception:
        # Do not leak internal details/paths to the client.
        _update(job_id, status="failed", stage="failed", error="Analysis failed due to an internal error.")


def load_result(job_id: str) -> Optional[Dict[str, Any]]:
    if not job_id.startswith("job_") or not job_id[4:].isalnum():
        return None
    p = RESULTS_DIR / f"{job_id}.json"
    return json.loads(p.read_text()) if p.exists() else None
