"""Central configuration. Paths and tunables live here; secrets would come from env vars."""
import os
import re
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("TRINETRA_DATA_DIR", BACKEND_DIR / "data"))
RESULTS_DIR = DATA_DIR / "analyses"
MODEL_DIR = BACKEND_DIR / "ml" / "models"
REPO_CACHE_DIR = DATA_DIR / "repos_cache"   # full clones used for training, named owner__repo

MODEL_PATH = MODEL_DIR / "model.pkl"
SCHEMA_PATH = MODEL_DIR / "feature_schema.json"

FEATURE_SCHEMA_VERSION = "1.0"

# Order matters: inference must use exactly this order (also stored in feature_schema.json).
FEATURE_COLUMNS = [
    "commit_count",
    "author_count",
    "lines_added",
    "lines_deleted",
    "total_churn",
    "loc",
    "complexity",
    "file_age_days",
    "days_since_last_change",
    "recent_commit_count",
    "bug_fix_count",
]

RECENT_WINDOW_DAYS = 90        # window for recent_commit_count
LABEL_WINDOW_DAYS = 180        # future window used to build the training label
SNAPSHOT_STEP_DAYS = 180       # spacing between training snapshots
MAX_SNAPSHOTS_PER_REPO = 6
MASS_CHANGE_FILE_LIMIT = 100   # commits touching more files than this are not counted as bug-fixes
MIN_HISTORY_DAYS_BEFORE_SNAPSHOT = 180
MAX_SOURCE_FILE_BYTES = 1_000_000

CLONE_TIMEOUT_SECONDS = int(os.environ.get("TRINETRA_CLONE_TIMEOUT", "240"))
GIT_TIMEOUT_SECONDS = 120

# Bug-fix heuristic (proxy label, NOT ground truth).
BUGFIX_REGEX = re.compile(
    r"\b(fix(?:es|ed|ing)?|bugs?|bugfix(?:es)?|hotfix(?:es)?|defects?|"
    r"patch(?:es|ed)?|regressions?|crash(?:es|ed)?|errors?|issues?)\b",
    re.IGNORECASE,
)

# Messages such as "Fix typo in docs" mention "fix" but are not defect fixes.
NON_DEFECT_REGEX = re.compile(r"\b(typos?|spelling|grammar|whitespace|formatting|lint)\b", re.IGNORECASE)

SKIP_PATH_PARTS = ("node_modules/", "venv/", ".venv/", "site-packages/", "vendor/", "/.git/")

# Presentation-only risk bands (not scientific thresholds).
RISK_BANDS = [(90, "Critical"), (70, "High"), (40, "Medium"), (0, "Low")]


def risk_category(score: float) -> str:
    for threshold, name in RISK_BANDS:
        if score >= threshold:
            return name
    return "Low"

DATASET_CSV = BACKEND_DIR / "ml" / "data" / "repository_features.csv"
DATASET_SUMMARY = BACKEND_DIR / "ml" / "data" / "dataset_summary.json"
