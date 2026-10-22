"""Unit tests on a synthetic git repository with controlled commit dates."""
import os
import subprocess
from pathlib import Path

import pytest

from app.services import git_service
from app.services.bugfix_service import is_bugfix_commit, is_bugfix_message
from app.services.complexity_service import analyze_source
from app.services.feature_service import build_feature_rows
from app.services.repository_service import InvalidRepoUrl, parse_repo_url

DAY = 86400
T0 = 1_600_000_000


def _commit(repo: Path, files: dict, msg: str, ts: int, author="a@x.com"):
    for name, content in files.items():
        (repo / name).write_text(content)
    env = {
        **os.environ,
        "GIT_AUTHOR_DATE": f"{ts} +0000",
        "GIT_COMMITTER_DATE": f"{ts} +0000",
        "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": author,
        "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": author,
    }
    subprocess.run(["git", "-C", str(repo), "add", "-A"], check=True, env=env)
    subprocess.run(["git", "-C", str(repo), "commit", "-q", "-m", msg], check=True, env=env)


@pytest.fixture()
def repo(tmp_path):
    r = tmp_path / "r"
    r.mkdir()
    subprocess.run(["git", "init", "-q", str(r)], check=True)
    _commit(r, {"a.py": "def f(x):\n    if x:\n        return 1\n    return 0\n",
                "b.py": "x = 1\n"}, "Initial commit", T0, "alice@x.com")
    _commit(r, {"a.py": "def f(x):\n    if x > 1:\n        return 1\n    return 0\n"},
            "Fix crash in f", T0 + 10 * DAY, "bob@x.com")
    # --- snapshot T is here (T0 + 20d) ---
    _commit(r, {"b.py": "x = 2\n"}, "Fix error in b", T0 + 30 * DAY, "alice@x.com")
    return r


def test_heuristic():
    assert is_bugfix_message("Fix crash when input is empty")
    assert is_bugfix_message("Resolve regression in parser")
    assert not is_bugfix_message("Add new feature")
    assert not is_bugfix_message("Fix typo in docs")
    assert not is_bugfix_commit("Fix bug", 500)  # mass-change commit ignored


def test_complexity_radon_and_fallback():
    loc, cx, method = analyze_source("def f(x):\n    if x:\n        return 1\n    return 0\n")
    assert (loc, method) == (4, "radon") and cx == 2
    loc, cx, method = analyze_source("print 'py2'\nif x:\n    pass\n")
    assert method == "regex_fallback" and cx >= 2


def test_features_are_leak_free_and_labels_are_future_only(repo):
    commits = git_service.read_commits(repo)
    rows = build_feature_rows(
        repo, "t/r", T0 + 20 * DAY, label_window_days=60, with_label=True, commits=commits
    )
    by = {r["file_path"]: r for r in rows}
    a, b = by["a.py"], by["b.py"]
    # features only see history <= T
    assert a["commit_count"] == 2 and a["author_count"] == 2 and a["bug_fix_count"] == 1
    assert b["commit_count"] == 1 and b["bug_fix_count"] == 0   # future fix NOT visible
    # label = bug fix in the future window
    assert a["label"] == 0 and b["label"] == 1
    assert a["days_since_last_change"] == 10 and a["file_age_days"] == 20


def test_inference_snapshot_has_no_label(repo):
    rows = build_feature_rows(repo, "t/r")
    assert rows and all("label" not in r for r in rows)
    assert {r["file_path"]: r["bug_fix_count"] for r in rows} == {"a.py": 1, "b.py": 1}


def test_url_validation():
    assert parse_repo_url("https://github.com/pallets/flask") == ("pallets", "flask")
    assert parse_repo_url("https://github.com/pallets/flask.git/") == ("pallets", "flask")
    for bad in ["", "http://github.com/a/b", "https://gitlab.com/a/b",
                "https://github.com/a", "https://github.com/a/b/c", "file:///etc/passwd",
                "https://github.com/a/b;rm -rf /"]:
        with pytest.raises(InvalidRepoUrl):
            parse_repo_url(bad)
