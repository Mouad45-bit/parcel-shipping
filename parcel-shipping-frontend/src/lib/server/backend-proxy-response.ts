import { NextResponse } from "next/server";

/*
 * Ces statuts HTTP ne peuvent jamais contenir de body.
 */
const noBodyStatuses = new Set([
  204,
  205,
  304,
]);

/*
 * Seuls les headers utiles et sûrs sont retransmis
 * depuis le backend vers le navigateur.
 */
const forwardedHeaderNames = [
  "content-type",
  "pragma",
  "www-authenticate",
  "location",
  "retry-after",
] as const;

type HeadersWithGetSetCookie = Headers & {
  getSetCookie?: () => string[];
};

function appendSetCookieHeaders(
  sourceHeaders: Headers,
  targetHeaders: Headers,
) {
  /*
   * Node/Undici permet de récupérer séparément plusieurs
   * headers Set-Cookie avec getSetCookie().
   */
  const setCookieHeaders =
    (
      sourceHeaders as
        HeadersWithGetSetCookie
    ).getSetCookie?.() ?? [];

  if (setCookieHeaders.length > 0) {
    for (
      const setCookieHeader
      of setCookieHeaders
    ) {
      targetHeaders.append(
        "set-cookie",
        setCookieHeader,
      );
    }

    return;
  }

  /*
   * Compatibilité de repli lorsqu'un seul cookie
   * est présent ou que getSetCookie() est absent.
   */
  const setCookieHeader =
    sourceHeaders.get("set-cookie");

  if (setCookieHeader) {
    targetHeaders.append(
      "set-cookie",
      setCookieHeader,
    );
  }
}

export async function createBackendProxyResponse(
  backendResponse: Response,
): Promise<NextResponse> {
  const responseHeaders =
    new Headers();

  /*
   * Les réponses BFF contenant des données privées
   * ne doivent jamais être mises en cache.
   */
  responseHeaders.set(
    "cache-control",
    "no-store",
  );

  for (
    const headerName
    of forwardedHeaderNames
  ) {
    const headerValue =
      backendResponse.headers.get(
        headerName,
      );

    if (headerValue) {
      responseHeaders.set(
        headerName,
        headerValue,
      );
    }
  }

  appendSetCookieHeaders(
    backendResponse.headers,
    responseHeaders,
  );

  /*
   * Un statut 204, 205 ou 304 doit recevoir null,
   * jamais une chaîne vide.
   */
  if (
    noBodyStatuses.has(
      backendResponse.status,
    )
  ) {
    return new NextResponse(null, {
      status:
        backendResponse.status,
      headers: responseHeaders,
    });
  }

  /*
   * arrayBuffer() préserve le body sans imposer
   * qu'il soit nécessairement du JSON ou du texte.
   */
  const responseBody =
    await backendResponse.arrayBuffer();

  return new NextResponse(
    responseBody,
    {
      status:
        backendResponse.status,
      headers: responseHeaders,
    },
  );
}
