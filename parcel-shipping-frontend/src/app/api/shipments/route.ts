import { NextRequest, NextResponse } from "next/server";

const backendApiBaseUrl =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = new URL("/api/shipments", backendApiBaseUrl);

    request.nextUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const responseBody = await response.text();
    const contentType = response.headers.get("content-type") ?? "application/json";

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 503,
        error: "Service Unavailable",
        code: "BACKEND_UNAVAILABLE",
        message: "The shipments backend is currently unavailable.",
        path: "/api/shipments",
        fieldErrors: [],
      },
      { status: 503 },
    );
  }
}
