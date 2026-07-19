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
    exportId: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { exportId } = await context.params;

  try {
    const headers = createBackendHeaders(request, "application/json");
    appendCsrfHeader(request, headers);

    const response = await fetch(
      new URL(`/api/exports/${encodeURIComponent(exportId)}/archive`, backendApiBaseUrl),
      {
        method: "PATCH",
        headers,
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
        path: `/api/exports/${exportId}/archive`,
        fieldErrors: [],
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
