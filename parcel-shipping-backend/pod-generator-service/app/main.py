import logging
import re

from fastapi import FastAPI
from fastapi.responses import (
    JSONResponse,
    Response,
)

from app.models import (
    HealthResponse,
    PodGenerationRequest,
)
from app.renderer import render_pod_png


logger = logging.getLogger(
    "pod-generator-service"
)

app = FastAPI(
    title="POD Generator Service",
    description=(
        "Internal service generating "
        "placeholder POD images."
    ),
    version="1.0.0",
)


@app.get(
    "/actuator/health",
    response_model=HealthResponse,
    include_in_schema=False,
)
def health() -> HealthResponse:
    return HealthResponse(
        status="UP",
    )


@app.post(
    "/internal/pods/generate",
    response_class=Response,
    responses={
        200: {
            "description": (
                "Generated POD image."
            ),
            "content": {
                "image/png": {},
            },
        },
        422: {
            "description": (
                "Invalid generation request."
            ),
        },
        500: {
            "description": (
                "POD generation failed."
            ),
        },
    },
)
def generate_pod(
    request: PodGenerationRequest,
) -> Response:
    try:
        png_content = render_pod_png(
            request
        )
    except Exception:
        logger.exception(
            "Unable to generate POD for %s.",
            request.tracking_code,
        )

        return JSONResponse(
            status_code=500,
            content={
                "code":
                    "POD_GENERATION_FAILED",
                "message":
                    "Unable to generate the POD image.",
            },
            headers={
                "Cache-Control": "no-store",
                "Pragma": "no-cache",
            },
        )

    safe_tracking_code = re.sub(
        r"[^A-Za-z0-9_-]",
        "_",
        request.tracking_code,
    )

    filename = (
        f"{safe_tracking_code}"
        f"-pod-{request.position}.png"
    )

    return Response(
        content=png_content,
        media_type="image/png",
        headers={
            "Content-Disposition":
                f'inline; filename="{filename}"',
            "Cache-Control":
                "no-store",
            "Pragma":
                "no-cache",
            "X-Content-Type-Options":
                "nosniff",
        },
    )
