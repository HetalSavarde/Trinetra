"""Bug-Fix Detector: keyword heuristic over commit messages.

This is a PROXY signal, not ground truth.
  * False positives: a message mentions an "issue" without fixing a defect.
  * False negatives: vague messages such as "update foo".
Two guards reduce noise: typo/formatting-style messages are excluded, and mass-change commits
(touching more than MASS_CHANGE_FILE_LIMIT files) are not attributed to every file they touch.
"""
from app.config import BUGFIX_REGEX, MASS_CHANGE_FILE_LIMIT, NON_DEFECT_REGEX


def is_bugfix_message(message: str) -> bool:
    message = message or ""
    return bool(BUGFIX_REGEX.search(message)) and not NON_DEFECT_REGEX.search(message)


def is_bugfix_commit(message: str, n_files_changed: int) -> bool:
    return n_files_changed <= MASS_CHANGE_FILE_LIMIT and is_bugfix_message(message)
