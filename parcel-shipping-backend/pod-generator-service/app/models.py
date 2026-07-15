from datetime import datetime
from typing import Annotated, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
)


TrackingCode = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
        max_length=40,
    ),
]

ClientCode = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
        max_length=80,
    ),
]

Destination = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
        max_length=120,
    ),
]


class PodGenerationRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="forbid",
    )

    tracking_code: TrackingCode = Field(
        alias="trackingCode",
    )

    client: ClientCode

    destination: Destination

    dispatch_date: datetime = Field(
        alias="dispatchDate",
    )

    status_date: datetime = Field(
        alias="statusDate",
    )

    position: int = Field(
        ge=1,
        le=3,
    )


class HealthResponse(BaseModel):
    status: Literal["UP"]
