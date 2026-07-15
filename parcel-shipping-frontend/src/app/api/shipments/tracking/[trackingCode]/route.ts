import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createBackendProxyResponse } from "@/lib/server/backend-proxy-response";

const backendApiBaseUrl =
  process.env.BACKEND_API_BASE_URL ??
  "http://localhost:8080";

type ShipmentTrackingRouteContext = {
  params: Promise<{
    trackingCode: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: ShipmentTrackingRouteContext,
) {
  const { trackingCode } =
    await context.params;

  try {
    const backendUrl = new URL(
      `/api/shipments/tracking/${encodeURIComponent(
        trackingCode,
      )}`,
      backendApiBaseUrl,
    );

    const requestHeaders =
      new Headers({
        Accept: "application/json",
      });

    const cookieHeader =
      request.headers.get("cookie");

    if (cookieHeader) {
      requestHeaders.set(
        "cookie",
        cookieHeader,
      );
    }

    const backendResponse =
      await fetch(backendUrl, {
        method: "GET",
        headers: requestHeaders,
        cache: "no-store",
      });

    return await createBackendProxyResponse(
      backendResponse,
    );
  } catch (error: unknown) {
    console.error(
      "Unable to proxy shipment tracking request.",
      error,
    );

    return NextResponse.json(
      {
        timestamp:
          new Date().toISOString(),
        status: 503,
        error:
          "Service Unavailable",
        code:
          "SHIPMENTS_BACKEND_UNAVAILABLE",
        message:
          "The shipments service is currently unavailable.",
        path:
          `/api/shipments/tracking/${trackingCode}`,
        fieldErrors: [],
      },
      {
        status: 503,
        headers: {
          "cache-control":
            "no-store",
        },
      },
    );
  }
}
