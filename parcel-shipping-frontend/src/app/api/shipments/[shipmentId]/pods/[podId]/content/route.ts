import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createBackendProxyResponse } from "@/lib/server/backend-proxy-response";
import {
  backendApiBaseUrl,
  createBackendHeaders,
} from "@/lib/server/backend-request";

type RouteContext = {
  params: Promise<{
    shipmentId: string;
    podId: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { shipmentId, podId } = await context.params;

  try {
    const backendUrl = new URL(
      `/api/shipments/${encodeURIComponent(shipmentId)}/pods/${encodeURIComponent(
        podId,
      )}/content`,
      backendApiBaseUrl,
    );

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: createBackendHeaders(request, "image/png,application/json"),
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
        path: `/api/shipments/${shipmentId}/pods/${podId}/content`,
        fieldErrors: [],
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
