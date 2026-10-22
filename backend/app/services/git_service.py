"""Git History Analyzer: reads commit history and file contents from a local clone."""
import subprocess
from pathlib import Path
from typing import Dict, List

import pandas as pd

from app.config import GIT_TIMEOUT_SECONDS, MAX_SOURCE_FILE_BYTES, SKIP_PATH_PARTS
from app.services.bugfix_service import is_bugfix_commit

_REC = "\x1e"   # record separator between commits
_FLD = "\x1f"   # field separator inside the header line


def _git(repo: Path, *args: str) -> bytes:
    proc = subprocess.run(
        ["git", "-C", str(repo), *args],
        capture_output=True, timeout=GIT_TIMEOUT_SECONDS,
    )
    if proc.returncode != 0:
        raise RuntimeError("git command failed")
    return proc.stdout


def branch_name(repo: Path) -> str:
    """Return the checked-out branch name, falling back to HEAD for detached clones."""
    try:
        out = _git(repo, "branch", "--show-current").decode("utf-8", errors="replace").strip()
        return out or "HEAD"
    except Exception:
        return "HEAD"


def head_commit(repo: Path) -> Dict[str, object]:
    out = _git(repo, "log", "-1", "--pretty=format:%H%x1f%at").decode()
    sha, ts = out.split(_FLD)
    return {"sha": sha, "ts": int(ts)}


def read_history(repo: Path) -> pd.DataFrame:
    """One row per (commit, changed .py file). Merge commits are excluded; renames are not followed
    (a renamed file appears as a delete + add), which is a documented limitation."""
    raw = _git(
        repo, "log", "--no-merges", "--no-renames", "--numstat",
        f"--pretty=format:{_REC}%H{_FLD}%ae{_FLD}%at{_FLD}%s",
    ).decode("utf-8", errors="replace")

    rows: List[dict] = []
    for block in raw.split(_REC):
        block = block.strip("\n")
        if not block:
            continue
        lines = block.split("\n")
        try:
            sha, author, ts, subject = lines[0].split(_FLD, 3)
            ts_i = int(ts)
        except ValueError:
            continue
        stat_lines = [ln.split("\t") for ln in lines[1:]]
        stat_lines = [p for p in stat_lines if len(p) == 3]
        # Mass-change commits (counting ALL files, not just .py) are not treated as bug-fixes.
        fix = is_bugfix_commit(subject, len(stat_lines))
        for parts in stat_lines:
            added, deleted, path = parts
            if not path.endswith(".py") or any(p in path for p in SKIP_PATH_PARTS):
                continue
            rows.append({
                "sha": sha, "author": author, "ts": ts_i, "subject": subject, "is_fix": fix,
                "path": path,
                "added": int(added) if added.isdigit() else 0,    # "-" for binary files
                "deleted": int(deleted) if deleted.isdigit() else 0,
            })
    cols = ["sha", "author", "ts", "subject", "is_fix", "path", "added", "deleted"]
    return pd.DataFrame(rows, columns=cols)


read_commits = read_history  # name used by the earlier test-suite


def read_python_sources(repo: Path, commit_sha: str) -> Dict[str, str]:
    """Return {path: text} for every .py file in the tree of `commit_sha` (no checkout needed)."""
    names = _git(repo, "ls-tree", "-r", "--name-only", commit_sha).decode("utf-8", errors="replace").split("\n")
    paths = [p for p in names if p.endswith(".py") and not any(s in p for s in SKIP_PATH_PARTS)]
    if not paths:
        return {}
    request = "".join(f"{commit_sha}:{p}\n" for p in paths).encode()
    proc = subprocess.run(
        ["git", "-C", str(repo), "cat-file", "--batch"],
        input=request, capture_output=True, timeout=GIT_TIMEOUT_SECONDS,
    )
    out, pos, sources = proc.stdout, 0, {}
    for p in paths:
        nl = out.find(b"\n", pos)
        if nl < 0:
            break
        header = out[pos:nl].split()
        if len(header) == 3 and header[1] == b"blob":
            size = int(header[2])
            content = out[nl + 1: nl + 1 + size]
            pos = nl + 1 + size + 1
            if size <= MAX_SOURCE_FILE_BYTES:
                sources[p] = content.decode("utf-8", errors="replace")
        else:  # "<name> missing"
            pos = nl + 1
    return sources
