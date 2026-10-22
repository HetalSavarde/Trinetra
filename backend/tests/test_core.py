import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.bugfix_service import is_bugfix_message
from app.services.complexity_service import analyze_source
from app.services.feature_service import DAY, build_snapshot_features
from app.services.repository_service import RepositoryError, parse_repo_url


@pytest.mark.parametrize("msg,expected", [
    ("Fix crash when parsing empty input", True),
    ("hotfix: patch regression in loader", True),
    ("Add new feature for colours", False),
    ("Update docs", False),
    ("prefix handling", False),   # 'fix' inside a word must not match
])
def test_bugfix_heuristic(msg, expected):
    assert is_bugfix_message(msg) is expected


def test_url_validation():
    assert parse_repo_url("https://github.com/pallets/click") == ("pallets", "click")
    assert parse_repo_url("https://github.com/pallets/click.git") == ("pallets", "click")
    for bad in ["", "http://github.com/a/b", "https://evil.com/a/b", "https://github.com/a", "file:///etc/passwd",
                "https://github.com/a/b; rm -rf /"]:
        with pytest.raises(RepositoryError):
            parse_repo_url(bad)


def test_malformed_file_does_not_crash():
    loc, cx, method = analyze_source("def broken(:\n    if x:\n")
    assert method == "regex_fallback" and loc >= 1 and cx >= 1


def test_label_uses_only_future_window_and_features_only_past():
    T = 1_700_000_000
    rows = [
        # (sha, author, ts, is_fix, path)
        ("a", "x@x", T - 10 * DAY, True, "m.py"),     # past bug-fix -> feature, never the label
        ("b", "y@x", T - 5 * DAY, False, "m.py"),
        ("c", "x@x", T + 10 * DAY, True, "m.py"),     # future fix -> label = 1
        ("d", "x@x", T + 10 * DAY, False, "n.py"),    # future non-fix -> label = 0
        ("e", "x@x", T - 1 * DAY, False, "n.py"),
    ]
    hist = pd.DataFrame([{"sha": s, "author": a, "ts": t, "subject": "", "is_fix": f, "path": p,
                          "added": 3, "deleted": 1} for s, a, t, f, p in rows])
    sources = {"m.py": "x = 1\n", "n.py": "y = 2\n"}
    df = build_snapshot_features("r", hist, sources, T, with_label=True).set_index("file_path")
    assert df.loc["m.py", "label"] == 1 and df.loc["n.py", "label"] == 0
    assert df.loc["m.py", "commit_count"] == 2      # the future commit "c" is excluded
    assert df.loc["m.py", "bug_fix_count"] == 1     # only the past fix
    assert df.loc["m.py", "author_count"] == 2


def test_api_health_and_validation():
    c = TestClient(app)
    assert c.get("/health").json()["status"] == "ok"
    r = c.post("/api/v1/analyze", json={"repoUrl": "not a url"})
    assert r.status_code == 422 and "Invalid repository URL" in r.json()["detail"]
    assert c.get("/api/v1/jobs/nope").status_code == 404
