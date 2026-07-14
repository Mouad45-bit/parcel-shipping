import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createBackendProxyResponse } from "@/lib/server/backend-proxy-response";

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

    const csrfTokenHeader =
      request.headers.get(
        "x-xsrf-token",
      );

    if (csrfTokenHeader) {
      requestHeaders.set(
        "x-xsrf-token",
        csrfTokenHeader,
      );
    }

    const backendResponse =
      await fetch(backendUrl, {
        method: "POST",
        headers: requestHeaders,
        cache: "no-store",
      });

    return await createBackendProxyResponse(
      backendResponse,
    );
  } catch (error: unknown) {
    /*
     * Ne jamais masquer complètement l'erreur réelle
     * dans les journaux serveur.
     */
    console.error(
      "Unable to proxy authentication logout.",
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
          "AUTHENTICATION_BACKEND_UNAVAILABLE",
        message:
          "The authentication service is currently unavailable.",
        path:
          "/api/auth/logout",
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