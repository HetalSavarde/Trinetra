from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.api import analyze, files, health, repositories

app = FastAPI(title="TRINETRA API", version="0.1.0",
              description="File-level maintenance/defect-risk prediction (Semester 5 prototype).")

# Allow the Next.js dev server. Override origins via config/env when deploying (deferred).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"], allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(analyze.router)
app.include_router(repositories.router)
app.include_router(files.router)

_DASH = Path(__file__).parent / "static" / "dashboard.html"


@app.get("/dashboard", include_in_schema=False)
def dashboard():
    """Minimal built-in dashboard that consumes the real API (stand-in until the Next.js app is wired)."""
    return FileResponse(_DASH)
