from __future__ import annotations

from hashlib import sha256
from io import BytesIO
from pathlib import Path
from re import split

from PIL import (
    Image,
    ImageDraw,
    ImageFont,
)

from app.models import PodGenerationRequest


IMAGE_WIDTH = 1240
IMAGE_HEIGHT = 1754

PRIMARY = (92, 51, 23)
SECONDARY = (255, 218, 185)
INK = (6, 6, 6)
MUTED = (103, 103, 103)
BORDER = (218, 218, 218)
SURFACE = (250, 248, 246)
WHITE = (255, 255, 255)
SUCCESS = (34, 120, 70)

FONT_DIRECTORY = Path(
    "/usr/share/fonts/truetype/dejavu"
)

REGULAR_FONT_PATH = (
    FONT_DIRECTORY
    / "DejaVuSans.ttf"
)

BOLD_FONT_PATH = (
    FONT_DIRECTORY
    / "DejaVuSans-Bold.ttf"
)


def _font(
    size: int,
    *,
    bold: bool = False,
) -> ImageFont.FreeTypeFont:
    path = (
        BOLD_FONT_PATH
        if bold
        else REGULAR_FONT_PATH
    )

    return ImageFont.truetype(
        str(path),
        size=size,
    )


def _display_client(
    value: str,
) -> str:
    words = [
        word
        for word in split(
            r"[\s_-]+",
            value,
        )
        if word
    ]

    if not words:
        return value

    return " ".join(
        word.capitalize()
        for word in words
    )


def _ellipsize(
    draw: ImageDraw.ImageDraw,
    value: str,
    font: ImageFont.FreeTypeFont,
    maximum_width: int,
) -> str:
    if (
        draw.textlength(
            value,
            font=font,
        )
        <= maximum_width
    ):
        return value

    suffix = "..."

    shortened = value

    while shortened:
        candidate = (
            shortened.rstrip()
            + suffix
        )

        if (
            draw.textlength(
                candidate,
                font=font,
            )
            <= maximum_width
        ):
            return candidate

        shortened = shortened[:-1]

    return suffix


def _draw_package_icon(
    draw: ImageDraw.ImageDraw,
    left: int,
    top: int,
) -> None:
    draw.rounded_rectangle(
        (
            left,
            top,
            left + 108,
            top + 108,
        ),
        radius=22,
        fill=SECONDARY,
    )

    draw.rectangle(
        (
            left + 29,
            top + 33,
            left + 79,
            top + 78,
        ),
        outline=PRIMARY,
        width=4,
    )

    draw.line(
        (
            left + 29,
            top + 45,
            left + 54,
            top + 58,
            left + 79,
            top + 45,
        ),
        fill=PRIMARY,
        width=4,
    )

    draw.line(
        (
            left + 54,
            top + 58,
            left + 54,
            top + 78,
        ),
        fill=PRIMARY,
        width=4,
    )


def _draw_information_row(
    draw: ImageDraw.ImageDraw,
    *,
    top: int,
    label: str,
    value: str,
    value_font: ImageFont.FreeTypeFont,
) -> None:
    label_font = _font(
        24,
        bold=True,
    )

    draw.text(
        (110, top),
        label.upper(),
        fill=MUTED,
        font=label_font,
    )

    normalized_value = _ellipsize(
        draw,
        value,
        value_font,
        730,
    )

    draw.text(
        (390, top - 3),
        normalized_value,
        fill=INK,
        font=value_font,
    )

    draw.line(
        (
            110,
            top + 52,
            1130,
            top + 52,
        ),
        fill=BORDER,
        width=2,
    )


def _draw_signature_placeholder(
    draw: ImageDraw.ImageDraw,
    request: PodGenerationRequest,
) -> None:
    left = 110
    top = 1240
    right = 1130
    bottom = 1545

    draw.rounded_rectangle(
        (
            left,
            top,
            right,
            bottom,
        ),
        radius=20,
        outline=BORDER,
        width=3,
        fill=WHITE,
    )

    draw.text(
        (
            left + 34,
            top + 28,
        ),
        "RECIPIENT CONFIRMATION",
        fill=MUTED,
        font=_font(
            24,
            bold=True,
        ),
    )

    draw.text(
        (
            left + 34,
            top + 82,
        ),
        "Generated signature placeholder",
        fill=INK,
        font=_font(28),
    )

    digest = sha256(
        (
            request.tracking_code
            + ":"
            + str(request.position)
        ).encode("utf-8")
    ).digest()

    points: list[
        tuple[int, int]
    ] = []

    signature_left = left + 90
    signature_width = 650
    signature_base = top + 215

    for index in range(22):
        x = (
            signature_left
            + index
            * signature_width
            // 21
        )

        byte_value = digest[
            index
            % len(digest)
        ]

        y = (
            signature_base
            - 38
            + byte_value % 76
        )

        points.append((x, y))

    draw.line(
        points,
        fill=PRIMARY,
        width=6,
        joint="curve",
    )

    draw.line(
        (
            left + 70,
            bottom - 55,
            left + 820,
            bottom - 55,
        ),
        fill=MUTED,
        width=2,
    )

    draw.ellipse(
        (
            right - 220,
            top + 80,
            right - 55,
            top + 245,
        ),
        outline=SUCCESS,
        width=5,
    )

    draw.text(
        (
            right - 191,
            top + 137,
        ),
        "POD",
        fill=SUCCESS,
        font=_font(
            31,
            bold=True,
        ),
    )


def render_pod_png(
    request: PodGenerationRequest,
) -> bytes:
    image = Image.new(
        "RGB",
        (
            IMAGE_WIDTH,
            IMAGE_HEIGHT,
        ),
        WHITE,
    )

    draw = ImageDraw.Draw(image)

    _draw_package_icon(
        draw,
        72,
        64,
    )

    draw.text(
        (210, 70),
        "PROOF OF DELIVERY",
        fill=INK,
        font=_font(
            50,
            bold=True,
        ),
    )

    draw.text(
        (212, 132),
        "Generated placeholder document",
        fill=MUTED,
        font=_font(24),
    )

    draw.line(
        (
            72,
            205,
            1168,
            205,
        ),
        fill=PRIMARY,
        width=4,
    )

    draw.rounded_rectangle(
        (
            72,
            245,
            1168,
            375,
        ),
        radius=20,
        fill=SURFACE,
        outline=BORDER,
        width=2,
    )

    draw.text(
        (110, 274),
        request.tracking_code,
        fill=INK,
        font=_font(
            40,
            bold=True,
        ),
    )

    draw.text(
        (110, 326),
        f"POD document {request.position}",
        fill=PRIMARY,
        font=_font(
            23,
            bold=True,
        ),
    )

    reference = sha256(
        (
            request.tracking_code
            + ":"
            + str(request.position)
        ).encode("utf-8")
    ).hexdigest()[:12].upper()

    draw.text(
        (815, 288),
        f"REF {reference}",
        fill=MUTED,
        font=_font(
            22,
            bold=True,
        ),
    )

    draw.rounded_rectangle(
        (
            72,
            420,
            1168,
            1090,
        ),
        radius=22,
        fill=WHITE,
        outline=BORDER,
        width=3,
    )

    value_font = _font(
        30,
        bold=True,
    )

    _draw_information_row(
        draw,
        top=480,
        label="Client",
        value=_display_client(
            request.client
        ),
        value_font=value_font,
    )

    _draw_information_row(
        draw,
        top=585,
        label="Destination",
        value=request.destination,
        value_font=value_font,
    )

    _draw_information_row(
        draw,
        top=690,
        label="Dispatch date",
        value=request.dispatch_date.isoformat(
            sep=" ",
            timespec="minutes",
        ),
        value_font=value_font,
    )

    _draw_information_row(
        draw,
        top=795,
        label="Status date",
        value=request.status_date.isoformat(
            sep=" ",
            timespec="minutes",
        ),
        value_font=value_font,
    )

    _draw_information_row(
        draw,
        top=900,
        label="Document",
        value=(
            f"{request.position} of maximum 3"
        ),
        value_font=value_font,
    )

    draw.rounded_rectangle(
        (
            110,
            1005,
            1130,
            1060,
        ),
        radius=14,
        fill=SECONDARY,
    )

    draw.text(
        (137, 1017),
        (
            "Placeholder generated automatically "
            "for seeded shipment data."
        ),
        fill=PRIMARY,
        font=_font(
            22,
            bold=True,
        ),
    )

    draw.text(
        (72, 1150),
        "DELIVERY RECEIPT",
        fill=INK,
        font=_font(
            34,
            bold=True,
        ),
    )

    draw.text(
        (72, 1195),
        (
            "This image is a general POD placeholder "
            "and does not represent a real recipient signature."
        ),
        fill=MUTED,
        font=_font(21),
    )

    _draw_signature_placeholder(
        draw,
        request,
    )

    draw.line(
        (
            72,
            1635,
            1168,
            1635,
        ),
        fill=BORDER,
        width=2,
    )

    draw.text(
        (72, 1665),
        request.tracking_code,
        fill=MUTED,
        font=_font(
            20,
            bold=True,
        ),
    )

    footer = (
        "Parcel Shipping · "
        f"POD {request.position}"
    )

    footer_width = draw.textlength(
        footer,
        font=_font(20),
    )

    draw.text(
        (
            1168 - footer_width,
            1665,
        ),
        footer,
        fill=MUTED,
        font=_font(20),
    )

    output = BytesIO()

    image.save(
        output,
        format="PNG",
        optimize=True,
    )

    return output.getvalue()
