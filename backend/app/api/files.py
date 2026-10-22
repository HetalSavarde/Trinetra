from fastapi import APIRouter, HTTPException

from app.api.repositories import _result_or_404

router = APIRouter(prefix="/api/v1/files")


@router.get("/detail")
def detail(jobId: str, path: str):
    res = _result_or_404(jobId)
    for f in res["files"]:
        if f["filePath"] == path:
            return {"repository": res["repository"], **f, "notice": res["notice"]}
    raise HTTPException(status_code=404, detail="File not found in this analysis.")
