"""Repository acquisition: URL validation, safe clone, cleanup.

Security notes: repository code is NEVER executed. We only run `git clone`/`git log`/`git show`
and parse Python source text with `ast`/radon (parsing, not running).
"""
import os
import re
import shutil
import subprocess
import tempfile
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator, Tuple

from app.config import CLONE_TIMEOUT_SECONDS

_GITHUB_URL = re.compile(
    r"^https://github\.com/(?P<owner>[A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))/"
    r"(?P<repo>[A-Za-z0-9._-]{1,100}?)(?:\.git)?/?$"
)


class RepositoryError(Exception):
    """Raised with a message that is safe to show to API clients."""


class InvalidRepoUrl(RepositoryError):
    """The URL is not a public https://github.com/<owner>/<repo> address."""


def parse_repo_url(url: str) -> Tuple[str, str]:
    """Return (owner, repo) for a public GitHub URL or raise RepositoryError."""
    m = _GITHUB_URL.match((url or "").strip())
    if not m:
        raise InvalidRepoUrl(
            "Invalid repository URL. Expected format: https://github.com/<owner>/<repository>"
        )
    return m.group("owner"), m.group("repo")


def clone_repo(url: str, dest: Path) -> None:
    owner, repo = parse_repo_url(url)
    clean_url = f"https://github.com/{owner}/{repo}.git"
    env = {**os.environ, "GIT_TERMINAL_PROMPT": "0"}
    try:
        proc = subprocess.run(
            ["git", "-c", "core.hooksPath=/dev/null", "clone", "--quiet", "--no-tags", clean_url, str(dest)],
            capture_output=True, text=True, timeout=CLONE_TIMEOUT_SECONDS, env=env,
        )
    except subprocess.TimeoutExpired:
        raise RepositoryError("Cloning the repository timed out. Try a smaller repository.")
    if proc.returncode != 0:
        # Do not leak stderr (may contain local paths); give a generic message.
        raise RepositoryError("Could not clone the repository. Check that it exists and is public.")


@contextmanager
def temporary_clone(url: str) -> Iterator[Path]:
    """Clone into a temp dir and ALWAYS delete it afterwards."""
    tmp = Path(tempfile.mkdtemp(prefix="trinetra_"))
    try:
        dest = tmp / "repo"
        clone_repo(url, dest)
        yield dest
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
