import {
  NextRequest,
  NextResponse,
} from "next/server";

const backendApiBaseUrl =
  process.env.BACKEND_API_BASE_URL ??
  "http://localhost:8080";

export async function POST(
  request: NextRequest,
) {
  try {
    const backendUrl = new URL(
      "/api/auth/logout",
      backendApiBaseUrl,
    );

    const requestHeaders = new Headers({
      Accept: "application/json",
    });

    const cookieHeader =
      request.headers.get("cookie");

    if (cookieHeader) {
      requestHeaders.set("cookie", cookieHeader);
    }

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: requestHeaders,
      cache: "no-store",
    });

    const responseBody = await response.text();

    const responseHeaders = new Headers({
      "cache-control": "no-store",
    });

    const contentType =
      response.headers.get("content-type");

    if (contentType) {
      responseHeaders.set(
        "content-type",
        contentType,
      );
    }

    const setCookieHeader =
      response.headers.get("set-cookie");

    if (setCookieHeader) {
      responseHeaders.set(
        "set-cookie",
        setCookieHeader,
      );
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
        message:
          "The authentication service is currently unavailable.",
        path: "/api/auth/logout",
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
