from __future__ import annotations

import base64
import binascii
import logging
import tempfile
from pathlib import Path

import cv2
import numpy as np
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from services.density_detector import DensityDetector

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analyze", tags=["density"])
detector = DensityDetector()


class DensityAnalyzeResponse(BaseModel):
    rho: float
    count: int
    area_m2: float
    status: str
    inference_time_ms: float


def calculate_status(rho: float) -> str:
    if rho < 0.4:
        return "NORMAL"
    if rho < 0.7:
        return "ELEVATED"
    return "CRITICAL"


def decode_base64_image(image_base64: str) -> np.ndarray:
    payload = image_base64
    if "," in image_base64 and "base64" in image_base64.split(",", maxsplit=1)[0]:
        payload = image_base64.split(",", maxsplit=1)[1]
    try:
        raw = base64.b64decode(payload, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValueError("Invalid base64 image payload") from exc

    np_buffer = np.frombuffer(raw, dtype=np.uint8)
    image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Unable to decode base64 image to frame")
    return image


class JsonDensityRequest(BaseModel):
    image_base64: str = Field(..., min_length=16)
    area_m2: float = Field(..., gt=0)


@router.post("/density", response_model=DensityAnalyzeResponse)
async def analyze_density(request: Request) -> DensityAnalyzeResponse:
    content_type = request.headers.get("content-type", "")
    try:
        if "application/json" in content_type:
            body = JsonDensityRequest.model_validate(await request.json())
            frame = decode_base64_image(body.image_base64)
            result = detector.analyze_frame(frame, body.area_m2)
        else:
            form = await request.form()
            area_raw = form.get("area_m2")
            if area_raw is None:
                raise ValueError("area_m2 is required")
            area_m2 = float(area_raw)
            if area_m2 <= 0:
                raise ValueError("area_m2 must be greater than zero")

            upload = form.get("video")
            image_base64 = form.get("image_base64")
            if upload is not None:
                suffix = Path(upload.filename or "upload.mp4").suffix or ".mp4"
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                    tmp.write(await upload.read())
                    temp_path = tmp.name
                try:
                    video_results = detector.analyze_video(temp_path, area_m2=area_m2)
                finally:
                    Path(temp_path).unlink(missing_ok=True)
                if not video_results:
                    raise ValueError("No frames could be analyzed from provided video")
                # Return latest frame snapshot for consistent response contract.
                result = video_results[-1]
            elif image_base64 is not None:
                frame = decode_base64_image(str(image_base64))
                result = detector.analyze_frame(frame, area_m2)
            else:
                raise ValueError("Provide either 'video' file upload or 'image_base64'")

        return DensityAnalyzeResponse(
            rho=result["rho"],
            count=result["count"],
            area_m2=result["area_m2"],
            status=calculate_status(result["rho"]),
            inference_time_ms=result["inference_time_ms"],
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unhandled density analysis failure")
        raise HTTPException(status_code=500, detail="Density analysis failed") from exc
