import { createBackendProxyResponse } from "@/lib/server/backend-proxy-response";
import { NextRequest, NextResponse } from "next/server";

const backendApiBaseUrl =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const backendUrl = new URL("/api/auth/login", backendApiBaseUrl);

    const requestBody = await request.text();

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type":
          request.headers.get("content-type") ?? "application/json",
      },
      body: requestBody,
      cache: "no-store",
    });
    return await createBackendProxyResponse(response);
  } catch (error: unknown) {
    console.error("Unable to proxy authentication login.", error);
    
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 503,
        error: "Service Unavailable",
        code: "AUTHENTICATION_BACKEND_UNAVAILABLE",
        message: "The authentication service is currently unavailable.",
        path: "/api/auth/login",
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
