from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.schemas.analysis import AnalyzeRequest, AnalyzeResponse, JobStatus
from app.services import analysis_service as svc
from app.services.repository_service import RepositoryError

router = APIRouter(prefix="/api/v1")


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest, background: BackgroundTasks):
    try:
        job = svc.create_job(req.repoUrl)
    except RepositoryError as e:
        raise HTTPException(status_code=422, detail=str(e))
    background.add_task(svc.run_job, job["jobId"])
    return {"jobId": job["jobId"], "repoName": job["repoName"], "status": "queued"}


@router.get("/jobs/{job_id}", response_model=JobStatus)
def job_status(job_id: str):
    job = svc.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Unknown job id.")
    return job
