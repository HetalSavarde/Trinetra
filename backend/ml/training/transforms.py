"""Importable transforms used inside the saved pipeline (must not live in __main__ or pickling breaks)."""
import numpy as np


def log1p(x):
    return np.log1p(np.clip(x, 0, None))
