"""Train + evaluate the baseline model and save artifacts.

Run from backend/:  python -m ml.training.train

Evaluation protocol: split BY REPOSITORY. Held-out repositories are never seen in training, so the
reported metrics reflect transfer to an unseen repository (not a random row split, which would leak
because consecutive snapshots of the same file are highly correlated).
Every number written to training_metrics.json is measured here; nothing is hard-coded.
"""
import json
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, StandardScaler

from ml.training.transforms import log1p
from app.config import (
    DATASET_CSV, FEATURE_COLUMNS, FEATURE_SCHEMA_VERSION, LABEL_WINDOW_DAYS, MODEL_DIR, MODEL_PATH,
    SCHEMA_PATH,
)

from ml.training.repos import TEST_REPOS
HOLDOUT_REPOS = TEST_REPOS   # never used for fitting
CSV = DATASET_CSV
METRICS_PATH = MODEL_DIR / "training_metrics.json"


def make_pipeline(estimator) -> Pipeline:
    pre = ColumnTransformer(
        [("num", Pipeline([("log", FunctionTransformer(log1p)), ("scale", StandardScaler())]), FEATURE_COLUMNS)]
    )
    return Pipeline([("pre", pre), ("clf", estimator)])


def evaluate(y_true, proba, threshold=0.5) -> dict:
    pred = (proba >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, pred, labels=[0, 1]).ravel()
    out = {
        "precision": round(float(precision_score(y_true, pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, pred, zero_division=0)), 4),
        "accuracy": round(float(accuracy_score(y_true, pred)), 4),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
    }
    out["roc_auc"] = round(float(roc_auc_score(y_true, proba)), 4) if len(set(y_true)) == 2 else None
    return out


def main() -> None:
    df = pd.read_csv(CSV)
    train = df[~df.repository.isin(HOLDOUT_REPOS)]
    test = df[df.repository.isin(HOLDOUT_REPOS)]
    if train.empty or test.empty:
        raise SystemExit("Train or held-out split is empty; check HOLDOUT_REPOS and the dataset.")

    X_tr, y_tr = train[FEATURE_COLUMNS], train.label.values
    X_te, y_te = test[FEATURE_COLUMNS], test.label.values

    models = {
        "logistic_regression": make_pipeline(LogisticRegression(max_iter=2000, class_weight="balanced")),
        "random_forest": make_pipeline(RandomForestClassifier(
            n_estimators=200, min_samples_leaf=5, class_weight="balanced", random_state=42, n_jobs=-1)),
    }
    results = {}
    for name, pipe in models.items():
        pipe.fit(X_tr, y_tr)
        results[name] = evaluate(y_te, pipe.predict_proba(X_te)[:, 1])

    # Trivial reference: "risky if the file already had a bug-fix commit before T".
    naive = (test.bug_fix_count.values > 0).astype(float)
    results["naive_rule_bug_fix_count_gt_0"] = evaluate(y_te, naive)

    # Saved model = interpretable baseline (logistic regression), refit on ALL data for the API.
    # Held-out metrics above come from the train-only fit; the saved model has seen all repos.
    final = make_pipeline(LogisticRegression(max_iter=2000, class_weight="balanced"))
    final.fit(df[FEATURE_COLUMNS], df.label.values)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(final, MODEL_PATH)
    schema = {
        "schema_version": FEATURE_SCHEMA_VERSION,
        "feature_order": FEATURE_COLUMNS,
        "preprocessing": "log1p -> StandardScaler (inside the saved sklearn Pipeline)",
        "label": f"1 if a likely bug-fix commit touches the file in the {LABEL_WINDOW_DAYS} days after the snapshot",
        "model": "LogisticRegression(class_weight=balanced)",
    }
    SCHEMA_PATH.write_text(json.dumps(schema, indent=2))

    metrics = {
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "feature_schema_version": FEATURE_SCHEMA_VERSION,
        "protocol": "split by repository; held-out repositories unseen during fitting",
        "train_repositories": sorted(train.repository.unique().tolist()),
        "heldout_repositories": sorted(test.repository.unique().tolist()),
        "n_train_rows": int(len(train)),
        "n_test_rows": int(len(test)),
        "class_distribution": {
            "train_positive_rate": round(float(y_tr.mean()), 4),
            "test_positive_rate": round(float(y_te.mean()), 4),
            "test_positives": int(y_te.sum()),
            "test_negatives": int((1 - y_te).sum()),
        },
        "heldout_results": results,
        "saved_model": "logistic_regression, refit on all rows (held-out metrics are from the train-only fit)",
        "caveats": [
            "Label is a keyword heuristic over commit messages (proxy, not ground truth).",
            "Small repository set; metrics are indicative only and not a final accuracy claim.",
            "Several snapshots per repo are correlated; rows are not independent.",
        ],
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2))
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
