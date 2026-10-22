from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services import analysis_service as svc

router = APIRouter(prefix="/api/v1/repositories")


def _result_or_404(job_id: str):
    res = svc.load_result(job_id)
    if res is None:
        job = svc.get_job(job_id)
        if job and job["status"] in ("queued", "running"):
            raise HTTPException(status_code=409, detail="Analysis not finished yet.")
        raise HTTPException(status_code=404, detail="No result for this job id.")
    return res


@router.get("/summary")
def summary(jobId: str):
    res = _result_or_404(jobId)
    return {"repository": res["repository"], "analyzedAt": res["analyzedAt"], "model": res["model"],
            "summary": res["summary"], "notice": res["notice"]}


@router.get("/files")
def files(jobId: str, category: Optional[str] = None, limit: int = Query(200, ge=1, le=2000)):
    res = _result_or_404(jobId)
    rows = res["files"]
    if category:
        rows = [f for f in rows if f["riskCategory"].lower() == category.lower()]
    return {"total": len(rows), "files": rows[:limit]}
