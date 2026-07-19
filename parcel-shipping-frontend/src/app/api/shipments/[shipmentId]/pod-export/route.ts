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

type RouteContext = {
  params: Promise<{
    shipmentId: string;
  }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const { shipmentId } = await context.params;

  try {
    const headers = createBackendHeaders(
      request,
      "application/pdf,application/json",
    );

    appendCsrfHeader(request, headers);

    const backendUrl = new URL(
      `/api/shipments/${encodeURIComponent(shipmentId)}/pod-export`,
      backendApiBaseUrl,
    );

    const response = await fetch(backendUrl, {
      method: "POST",
      headers,
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
        path: `/api/shipments/${shipmentId}/pod-export`,
        fieldErrors: [],
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
