import { NextRequest, NextResponse } from "next/server";

const backendApiBaseUrl =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:8080";

export async function PATCH(request: NextRequest) {
  try {
    const backendUrl = new URL("/api/auth/password", backendApiBaseUrl);

    const requestHeaders = new Headers({
      Accept: "application/json",
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    });

    const cookieHeader = request.headers.get("cookie");

    if (cookieHeader) {
      requestHeaders.set("cookie", cookieHeader);
    }

    const csrfTokenHeader = request.headers.get("x-xsrf-token");

    if (csrfTokenHeader) {
      requestHeaders.set("x-xsrf-token", csrfTokenHeader);
    }

    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: requestHeaders,
      body: await request.text(),
      cache: "no-store",
    });

    const responseBody = await response.text();

    const responseHeaders = new Headers({
      "cache-control": "no-store",
    });

    const contentType = response.headers.get("content-type");

    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 503,
        error: "Service Unavailable",
        code: "AUTHENTICATION_BACKEND_UNAVAILABLE",
        message: "The authentication service is currently unavailable.",
        path: "/api/auth/password",
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
