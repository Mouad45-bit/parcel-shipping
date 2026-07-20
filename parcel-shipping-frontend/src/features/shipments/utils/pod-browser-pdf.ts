"use client";

import {
  downloadBlob,
  fetchPodDocument,
  readShipmentsApiError,
  ShipmentsApiError,
} from "@/features/shipments/api/shipments-api";
import type { PodDocument } from "@/features/shipments/types/shipment";
import {
  formatShipmentDateTime,
  shipmentStatusLabels,
} from "@/features/shipments/utils/shipment-utils";

type BrowserPdfImage = {
  bytes: Uint8Array;
  width: number;
  height: number;
};

const a4Width = 595.28;
const a4Height = 841.89;
const pageMargin = 40;
const encoder = new TextEncoder();

function sanitizeFilename(value: string) {
  return value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

function escapePdfText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("\r", " ")
    .replaceAll("\n", " ");
}

function bytesFromBase64(value: string) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function loadImageAsJpegBytes(blob: Blob): Promise<BrowserPdfImage> {
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Unable to load a POD image."));
      nextImage.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to prepare the POD image for PDF generation.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);

    return {
      bytes: bytesFromBase64(base64),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function fetchPodImage(contentUrl: string, signal?: AbortSignal) {
  const response = await fetch(contentUrl, {
    method: "GET",
    headers: {
      Accept: "image/png,application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const error = await readShipmentsApiError(response);

    throw new ShipmentsApiError(
      error?.message ?? "Unable to load a POD image.",
      response.status,
      error?.code,
    );
  }

  return loadImageAsJpegBytes(await response.blob());
}

function textLine(value: string, x: number, y: number, size = 10) {
  return `BT /F1 ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(value)}) Tj ET\n`;
}

function buildPageContent(
  document: PodDocument,
  image: BrowserPdfImage,
  index: number,
) {
  const isFirstPage = index === 0;
  const lines = isFirstPage
    ? [
        { text: "Proof of Delivery", size: 18, gap: 26 },
        { text: `Client: ${document.client}`, size: 11, gap: 16 },
        {
          text: `Generated at: ${formatShipmentDateTime(document.generatedAt)}`,
          size: 11,
          gap: 28,
        },
        { text: `Tracking code: ${document.trackingCode}`, size: 10, gap: 15 },
        { text: `Destination: ${document.destination}`, size: 10, gap: 15 },
        {
          text: `Dispatch date: ${formatShipmentDateTime(document.dispatchDate)}`,
          size: 10,
          gap: 15,
        },
        {
          text: `Status: ${shipmentStatusLabels[document.status]}`,
          size: 10,
          gap: 15,
        },
        {
          text: `Status date: ${formatShipmentDateTime(document.statusDate)}`,
          size: 10,
          gap: 24,
        },
      ]
    : [
        { text: `Tracking code: ${document.trackingCode}`, size: 10, gap: 15 },
        {
          text: `Status date: ${formatShipmentDateTime(document.statusDate)}`,
          size: 10,
          gap: 24,
        },
      ];

  let y = a4Height - pageMargin;
  let content = "";

  lines.forEach((line) => {
    content += textLine(line.text, pageMargin, y, line.size);
    y -= line.gap;
  });

  const imageAreaTop = y;
  const imageAreaHeight = imageAreaTop - pageMargin;
  const imageAreaWidth = a4Width - pageMargin * 2;
  const imageRatio = image.width / image.height;
  const areaRatio = imageAreaWidth / imageAreaHeight;
  const renderedWidth =
    imageRatio > areaRatio ? imageAreaWidth : imageAreaHeight * imageRatio;
  const renderedHeight =
    imageRatio > areaRatio ? imageAreaWidth / imageRatio : imageAreaHeight;
  const imageX = pageMargin + (imageAreaWidth - renderedWidth) / 2;
  const imageY = pageMargin + (imageAreaHeight - renderedHeight) / 2;

  content += `q ${renderedWidth.toFixed(2)} 0 0 ${renderedHeight.toFixed(2)} ${imageX.toFixed(2)} ${imageY.toFixed(2)} cm /Im${index + 1} Do Q\n`;

  return encoder.encode(content);
}

function concatParts(parts: Uint8Array[]) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });

  return output;
}

function buildPdf(document: PodDocument, images: BrowserPdfImage[]) {
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let byteLength = 0;

  function push(part: string | Uint8Array) {
    const bytes = typeof part === "string" ? encoder.encode(part) : part;
    parts.push(bytes);
    byteLength += bytes.length;
  }

  function object(id: number, body: string | Uint8Array, dictionary = "") {
    offsets[id] = byteLength;
    push(`${id} 0 obj\n`);

    if (body instanceof Uint8Array) {
      push(`<< ${dictionary} /Length ${body.length} >>\nstream\n`);
      push(body);
      push("\nendstream\n");
    } else {
      push(body);
    }

    push("endobj\n");
  }

  push("%PDF-1.4\n");

  const pageIds = images.map((_, index) => 4 + index * 3);
  const contentIds = images.map((_, index) => 5 + index * 3);
  const imageIds = images.map((_, index) => 6 + index * 3);

  object(1, "<< /Type /Catalog /Pages 2 0 R >>\n");
  object(
    2,
    `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds
      .map((id) => `${id} 0 R`)
      .join(" ")}] >>\n`,
  );
  object(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n");

  images.forEach((image, index) => {
    object(
      pageIds[index],
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${a4Width} ${a4Height}] /Resources << /Font << /F1 3 0 R >> /XObject << /Im${index + 1} ${imageIds[index]} 0 R >> >> /Contents ${contentIds[index]} 0 R >>\n`,
    );
    object(contentIds[index], buildPageContent(document, image, index));
    object(
      imageIds[index],
      image.bytes,
      `/Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,
    );
  });

  const xrefOffset = byteLength;
  const objectCount = 3 + images.length * 3;

  push(`xref\n0 ${objectCount + 1}\n`);
  push("0000000000 65535 f \n");

  for (let id = 1; id <= objectCount; id += 1) {
    push(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  }

  push(
    `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );

  return new Blob([concatParts(parts)], { type: "application/pdf" });
}

export async function downloadBrowserGeneratedPodPdf(
  shipmentId: string,
  signal?: AbortSignal,
) {
  const document = await fetchPodDocument(shipmentId, signal);
  const images = await Promise.all(
    document.pods.map((pod) => fetchPodImage(pod.contentUrl, signal)),
  );
  const pdfBlob = buildPdf(document, images);
  const filename = `${sanitizeFilename(document.trackingCode) || "shipment"}-pod-print.pdf`;

  downloadBlob(pdfBlob, filename);
}
