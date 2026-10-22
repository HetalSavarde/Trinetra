"""Build ml/data/repository_features.csv from local clones (data/repos_cache/<owner>__<repo>).

Repositories come from ml/training/repos.py. Missing clones are fetched with `git clone`
(public repos only); the cloned code is parsed, never executed.

Run from backend/:  python -m ml.training.build_dataset
"""
import json
import subprocess
from datetime import datetime, timezone

import pandas as pd

from app.config import (
    DATASET_CSV, DATASET_SUMMARY, FEATURE_COLUMNS, FEATURE_SCHEMA_VERSION, LABEL_WINDOW_DAYS,
    REPO_CACHE_DIR,
)
from app.services import feature_service as fs
from app.services import git_service as gs
from ml.training.repos import TEST_REPOS, TRAIN_REPOS


def ensure_clone(full_name: str):
    dest = REPO_CACHE_DIR / full_name.replace("/", "__")
    if not (dest / ".git").exists():
        print(f"[clone] {full_name} ...", flush=True)
        REPO_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        subprocess.run(["git", "clone", "--quiet", "--no-tags", f"https://github.com/{full_name}.git", str(dest)],
                       check=True, timeout=600)
    return dest


def main() -> None:
    frames, summary = [], {}
    for full_name in TRAIN_REPOS + TEST_REPOS:
        repo_dir = ensure_clone(full_name)
        hist = gs.read_history(repo_dir)
        head = gs.head_commit(repo_dir)
        times = fs.snapshot_times(hist, head["ts"])
        snaps = []
        for t in times:
            rows = fs.build_feature_rows(repo_dir, full_name, t, with_label=True, commits=hist)
            if len(rows) < 10:
                continue
            df = pd.DataFrame(rows)
            frames.append(df)
            snaps.append({"date": df.snapshot_date.iloc[0], "files": len(df), "risky": int(df.label.sum())})
            print(f"[rows]  {full_name} @ {snaps[-1]['date']}: {len(df)} files, {snaps[-1]['risky']} risky", flush=True)
        summary[full_name] = {"head": head["sha"][:10], "commits": int(hist.sha.nunique()), "snapshots": snaps}

    data = pd.concat(frames, ignore_index=True)
    cols = ["repository", "file_path", "snapshot_date", "snapshot_commit", *FEATURE_COLUMNS, "label"]
    DATASET_CSV.parent.mkdir(parents=True, exist_ok=True)
    data[cols].to_csv(DATASET_CSV, index=False)
    DATASET_SUMMARY.write_text(json.dumps({
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "feature_schema_version": FEATURE_SCHEMA_VERSION,
        "label_definition": (f"1 if a likely bug-fix commit (commit-message heuristic) touches the file in the "
                             f"{LABEL_WINDOW_DAYS} days after the snapshot date; features use only history at or "
                             f"before the snapshot date"),
        "total_rows": int(len(data)), "positive_rows": int(data.label.sum()),
        "repositories": summary,
    }, indent=2))
    print(f"\nWrote {len(data)} rows ({int(data.label.sum())} risky) -> {DATASET_CSV}")


if __name__ == "__main__":
    main()
