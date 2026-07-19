import type { NextRequest } from "next/server";

export const backendApiBaseUrl =
  process.env.BACKEND_API_BASE_URL ??
  "http://localhost:8080";

export function createBackendHeaders(
  request: NextRequest,
  accept: string,
) {
  const headers = new Headers({
    Accept: accept,
  });

  const cookieHeader =
    request.headers.get("cookie");

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  return headers;
}

export function appendCsrfHeader(
  request: NextRequest,
  headers: Headers,
) {
  /*
   * Le contrat /api/auth/csrf fournit actuellement X-XSRF-TOKEN.
   * La logique est centralisée ici pour éviter le couplage métier.
   */
  const csrfToken = request.headers.get("x-xsrf-token");

  if (csrfToken) {
    headers.set("x-xsrf-token", csrfToken);
  }
}
