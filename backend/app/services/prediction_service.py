"""Saved ML Model wrapper. Loads the trained pipeline once; never retrains at request time."""
import json
from functools import lru_cache
from typing import Any, Dict, List

import joblib
import numpy as np
import pandas as pd

import ml.training.transforms  # noqa: F401  (the pickled pipeline references log1p from here)
from app.config import FEATURE_COLUMNS, MODEL_DIR, MODEL_PATH, SCHEMA_PATH, risk_category

FEATURE_LABELS = {
    "commit_count": "number of commits",
    "author_count": "number of distinct authors",
    "lines_added": "total lines added",
    "lines_deleted": "total lines deleted",
    "total_churn": "total churn (added + deleted)",
    "loc": "file size (LOC)",
    "complexity": "cyclomatic complexity",
    "file_age_days": "file age",
    "days_since_last_change": "time since last change",
    "recent_commit_count": "recent commit activity",
    "bug_fix_count": "past likely bug-fix commits",
}


class ModelNotAvailable(Exception):
    pass


@lru_cache(maxsize=1)
def _load():
    if not MODEL_PATH.exists() or not SCHEMA_PATH.exists():
        raise ModelNotAvailable("No trained model found. Run: python -m ml.training.train")
    pipe = joblib.load(MODEL_PATH)
    schema = json.loads(SCHEMA_PATH.read_text())
    if schema["feature_order"] != FEATURE_COLUMNS:
        raise ModelNotAvailable("Feature schema mismatch between model and code; retrain the model.")
    metrics_path = MODEL_DIR / "training_metrics.json"
    trained_at = json.loads(metrics_path.read_text()).get("trained_at") if metrics_path.exists() else None
    return pipe, {"feature_schema_version": schema["schema_version"], "trained_at": trained_at,
                  "model": schema["model"]}


def model_info() -> Dict[str, Any]:
    return _load()[1]


def predict_files(features: pd.DataFrame) -> List[Dict[str, Any]]:
    """Return one dict per file: riskScore (0-100), category, metrics and top risk factors."""
    if features.empty:
        return []
    pipe, _ = _load()
    X = features[FEATURE_COLUMNS]
    proba = pipe.predict_proba(X)[:, 1]

    # Explanation for logistic regression: contribution = coefficient * transformed feature value.
    Z = pipe.named_steps["pre"].transform(X)
    contrib = Z * pipe.named_steps["clf"].coef_[0]

    out = []
    for i, (_, row) in enumerate(features.iterrows()):
        score = round(float(proba[i]) * 100, 1)
        order = np.argsort(-contrib[i])[:3]
        factors = [
            {"feature": FEATURE_COLUMNS[j], "value": int(row[FEATURE_COLUMNS[j]]),
             "contribution": round(float(contrib[i][j]), 3),
             "text": f"{FEATURE_LABELS[FEATURE_COLUMNS[j]]} = {int(row[FEATURE_COLUMNS[j]])} raises predicted risk"}
            for j in order if contrib[i][j] > 0
        ]
        out.append({
            "filePath": row["file_path"],
            "riskScore": score,
            "riskCategory": risk_category(score),
            "metrics": {c: int(row[c]) for c in FEATURE_COLUMNS},
            "topFactors": factors,
        })
    return out
