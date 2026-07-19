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
    exportId: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { exportId } = await context.params;

  try {
    const response = await fetch(
      new URL(
        `/api/exports/${encodeURIComponent(exportId)}/content`,
        backendApiBaseUrl,
      ),
      {
        method: "GET",
        headers: createBackendHeaders(request, "application/pdf,application/json"),
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
        path: `/api/exports/${exportId}/content`,
        fieldErrors: [],
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
