import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createBackendProxyResponse } from "@/lib/server/backend-proxy-response";
import {
  backendApiBaseUrl,
  createBackendHeaders,
} from "@/lib/server/backend-request";

export async function GET(
  request: NextRequest,
) {
  try {
    const backendUrl = new URL("/api/exports", backendApiBaseUrl);

    request.nextUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: createBackendHeaders(request, "application/json"),
      cache: "no-store",
    });

    return await createBackendProxyResponse(response);
  } catch {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 503,
        error: "Service Unavailable",
        code: "SHIPMENTS_BACKEND_UNAVAILABLE",
        message: "The shipments service is currently unavailable.",
        path: "/api/exports",
        fieldErrors: [],
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
