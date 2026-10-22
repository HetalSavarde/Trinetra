from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    repoUrl: str = Field(..., description="Public GitHub URL, e.g. https://github.com/pallets/click")


class AnalyzeResponse(BaseModel):
    jobId: str
    repoName: str
    status: str


class JobStatus(BaseModel):
    jobId: str
    repoName: str
    status: str
    stage: str
    progress: int
    error: str | None = None
