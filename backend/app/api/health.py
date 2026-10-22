from fastapi import APIRouter

from app.services import prediction_service as ps

router = APIRouter()


@router.get("/health")
def health():
    try:
        info = ps.model_info()
        return {"status": "ok", "modelLoaded": True, "model": info}
    except ps.ModelNotAvailable as e:
        return {"status": "ok", "modelLoaded": False, "detail": str(e)}
