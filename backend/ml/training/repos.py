"""Repositories used to build the training dataset.

The split is by REPOSITORY (not by row): the test repositories are never seen
during training, which is a stricter and more honest evaluation than a random
row split (files from one project share style, authors and history).
"""

TRAIN_REPOS = [
    "psf/requests",
    "pallets/flask",
    "pallets/click",
    "pallets/jinja",
    "encode/httpx",
    "Textualize/rich",
]

# Held out entirely from training; used only for evaluation.
TEST_REPOS = [
    "pallets/werkzeug",
    "encode/starlette",
]

# Not in the dataset at all; used to demo inference on an unseen repository.
DEMO_REPO = "https://github.com/pallets/itsdangerous"
