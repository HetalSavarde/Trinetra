"""Source Code Analyzer: LOC and cyclomatic complexity for Python source text.

Only parses text; the analyzed code is never imported or executed.
"""
import re
from typing import Tuple

from radon.complexity import cc_visit
from radon.raw import analyze
from radon.visitors import Function

_BRANCH = re.compile(r"\b(if|elif|for|while|except|and|or|case|assert|with)\b")


def _fallback(text: str) -> Tuple[int, int]:
    """Used when radon cannot parse the file (e.g. Python 2 syntax): count code lines and branch keywords."""
    code = [ln for ln in text.splitlines() if ln.strip() and not ln.strip().startswith("#")]
    return len(code), 1 + sum(len(_BRANCH.findall(ln)) for ln in code)


def analyze_source(text: str) -> Tuple[int, int, str]:
    """Return (loc, complexity, method).

    loc        = radon SLOC (non-blank, non-comment source lines)
    complexity = sum of cyclomatic complexity over all functions/methods (classes skipped to avoid
                 double-counting), at least 1
    method     = "radon" or "regex_fallback" (recorded so the approximation is never hidden)
    A malformed file therefore never aborts the repository analysis.
    """
    try:
        loc = analyze(text).sloc
        blocks = cc_visit(text)
    except Exception:
        loc, cx = _fallback(text)
        return loc, cx, "regex_fallback"
    cx = sum(b.complexity for b in blocks if isinstance(b, Function))
    return loc, max(1, cx), "radon"
