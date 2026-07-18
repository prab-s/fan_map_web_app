import logging

from fastapi import APIRouter, Request
from fastapi.responses import Response

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/api/client-telemetry")
async def client_telemetry(request: Request):
    try:
        payload = await request.json()
    except Exception:
        payload = None

    logger.debug("Received public client telemetry: %s", payload)
    return Response(status_code=204)
