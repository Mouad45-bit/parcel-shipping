import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createBackendProxyResponse } from "@/lib/server/backend-proxy-response";
import {
  appendCsrfHeader,
  backendApiBaseUrl,
  createBackendHeaders,
} from "@/lib/server/backend-request";

export async function POST(
  request: NextRequest,
) {
  try {
    const headers = createBackendHeaders(
      request,
      "application/zip,application/json",
    );

    headers.set("content-type", "application/json");

    appendCsrfHeader(request, headers);

    const response = await fetch(
      new URL("/api/shipments/pod-export", backendApiBaseUrl),
      {
        method: "POST",
        headers,
        body: await request.text(),
        cache: "no-store",
      },
    );

    return await createBackendProxyResponse(response);
  } catch {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 503,
        error: "Service Unavailable",
        code: "SHIPMENTS_BACKEND_UNAVAILABLE",
        message: "The shipments service is currently unavailable.",
        path: "/api/shipments/pod-export",
        fieldErrors: [],
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
