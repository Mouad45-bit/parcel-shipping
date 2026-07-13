import {
  NextRequest,
  NextResponse,
} from "next/server";

const backendApiBaseUrl =
  process.env.BACKEND_API_BASE_URL ??
  "http://localhost:8080";

export async function GET(
  request: NextRequest,
) {
  try {
    const backendUrl = new URL(
      "/api/statistics/clients",
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

    const response = await fetch(
      backendUrl,
      {
        method: "GET",
        headers: requestHeaders,
        cache: "no-store",
      },
    );

    const responseBody =
      await response.text();

    return new NextResponse(
      responseBody,
      {
        status: response.status,
        headers: {
          "content-type":
            response.headers.get(
              "content-type",
            ) ??
            "application/json",
          "cache-control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        timestamp:
          new Date().toISOString(),
        status: 503,
        error:
          "Service Unavailable",
        code:
          "STATISTICS_BACKEND_UNAVAILABLE",
        message:
          "The statistics service is currently unavailable.",
        path:
          "/api/statistics/clients",
        fieldErrors: [],
      },
      {
        status: 503,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }
}
