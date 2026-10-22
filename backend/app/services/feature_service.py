"""Feature Engineering: turns history + source snapshot into one row per file.

Time-aware design (reduces target leakage):
  * Every feature at snapshot time T uses only commits with ts <= T and the file CONTENT at T.
  * The training label looks at a FUTURE window (T, T + LABEL_WINDOW_DAYS]:
        label = 1 if a likely bug-fix commit touched the file in that window.
  * For inference on a new repo, T = its latest commit and no label exists.
"""
from pathlib import Path
from typing import Dict, List, Optional

import pandas as pd

from app.config import (
    FEATURE_COLUMNS, LABEL_WINDOW_DAYS, MAX_SNAPSHOTS_PER_REPO,
    MIN_HISTORY_DAYS_BEFORE_SNAPSHOT, RECENT_WINDOW_DAYS, SNAPSHOT_STEP_DAYS,
)
from app.services import git_service
from app.services.complexity_service import analyze_source

DAY = 86400


def build_snapshot_features(
    repo_name: str, hist: pd.DataFrame, sources: Dict[str, str], snapshot_ts: int,
    with_label: bool = False, label_window_days: int = LABEL_WINDOW_DAYS,
) -> pd.DataFrame:
    """Feature rows for every file that exists in `sources` and has history <= T."""
    past = hist[(hist.ts <= snapshot_ts) & hist.path.isin(list(sources))]
    cols = ["repository", "file_path", "snapshot_date", *FEATURE_COLUMNS] + (["label"] if with_label else [])
    if past.empty:
        return pd.DataFrame(columns=cols)

    g = past.groupby("path")
    agg = g.agg(
        commit_count=("sha", "nunique"),
        author_count=("author", "nunique"),
        lines_added=("added", "sum"),
        lines_deleted=("deleted", "sum"),
        first_ts=("ts", "min"),
        last_ts=("ts", "max"),
        bug_fix_count=("is_fix", "sum"),
    )
    recent = (
        past[past.ts > snapshot_ts - RECENT_WINDOW_DAYS * DAY].groupby("path")["sha"].nunique()
    )

    fixed_future = set()
    if with_label:
        fut = hist[(hist.ts > snapshot_ts) & (hist.ts <= snapshot_ts + label_window_days * DAY) & hist.is_fix]
        fixed_future = set(fut.path)

    snap_date = pd.to_datetime(snapshot_ts, unit="s", utc=True).strftime("%Y-%m-%d")
    rows: List[dict] = []
    for path, r in agg.iterrows():
        loc, complexity, _method = analyze_source(sources[path])  # never raises; falls back if unparseable
        row = {
            "repository": repo_name,
            "file_path": path,
            "snapshot_date": snap_date,
            "commit_count": int(r.commit_count),
            "author_count": int(r.author_count),
            "lines_added": int(r.lines_added),
            "lines_deleted": int(r.lines_deleted),
            "total_churn": int(r.lines_added + r.lines_deleted),
            "loc": int(loc),
            "complexity": int(complexity),
            "file_age_days": int((snapshot_ts - r.first_ts) // DAY),
            "days_since_last_change": int((snapshot_ts - r.last_ts) // DAY),
            "recent_commit_count": int(recent.get(path, 0)),
            "bug_fix_count": int(r.bug_fix_count),
        }
        if with_label:
            row["label"] = int(path in fixed_future)
        rows.append(row)
    return pd.DataFrame(rows, columns=cols)


def build_feature_rows(
    repo_path: Path, repo_name: str, snapshot_ts: Optional[int] = None,
    label_window_days: int = LABEL_WINDOW_DAYS, with_label: bool = False,
    commits: Optional[pd.DataFrame] = None,
) -> List[dict]:
    """Convenience wrapper: feature rows for one snapshot of a local repository.

    snapshot_ts=None -> inference snapshot at the latest commit (no label possible).
    """
    hist = commits if commits is not None else git_service.read_history(repo_path)
    if hist.empty:
        return []
    if snapshot_ts is None:
        snapshot_ts = int(hist.ts.max()) + 1
        with_label = False
    sha = commit_at_or_before(hist, snapshot_ts)
    if not sha:
        return []
    sources = git_service.read_python_sources(repo_path, sha)
    df = build_snapshot_features(repo_name, hist, sources, snapshot_ts, with_label, label_window_days)
    df.insert(3, "snapshot_commit", sha[:10])
    return df.to_dict("records")


def snapshot_times(hist: pd.DataFrame, head_ts: int) -> List[int]:
    """Training snapshots spaced SNAPSHOT_STEP_DAYS apart, newest first, each with a full label
    window before HEAD and enough history before it."""
    first_ts = int(hist.ts.min())
    latest_allowed = head_ts - LABEL_WINDOW_DAYS * DAY
    times, t = [], latest_allowed
    while t - first_ts >= MIN_HISTORY_DAYS_BEFORE_SNAPSHOT * DAY and len(times) < MAX_SNAPSHOTS_PER_REPO:
        times.append(int(t))
        t -= SNAPSHOT_STEP_DAYS * DAY
    return times


def commit_at_or_before(hist: pd.DataFrame, ts: int) -> Optional[str]:
    c = hist[hist.ts <= ts].sort_values("ts")
    return None if c.empty else str(c.iloc[-1].sha)
