import { createBackendProxyResponse } from "@/lib/server/backend-proxy-response";
import { NextRequest, NextResponse } from "next/server";

const backendApiBaseUrl =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = new URL("/api/auth/csrf", backendApiBaseUrl);

    const requestHeaders = new Headers({
      Accept: "application/json",
    });

    const cookieHeader = request.headers.get("cookie");

    if (cookieHeader) {
      requestHeaders.set("cookie", cookieHeader);
    }

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });
    return await createBackendProxyResponse(response);
  } catch (error: unknown) {
    console.error("Unable to proxy CSRF token request.", error);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 503,
        error: "Service Unavailable",
        code: "AUTHENTICATION_BACKEND_UNAVAILABLE",
        message: "The authentication service is currently unavailable.",
        path: "/api/auth/csrf",
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
