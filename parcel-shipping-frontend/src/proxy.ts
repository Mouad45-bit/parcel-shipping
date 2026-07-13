import {
  NextRequest,
  NextResponse,
} from "next/server";

const accessTokenCookieName =
  "parcel_access_token";

export default function proxy(
  request: NextRequest,
) {
  const accessToken =
    request.cookies.get(
      accessTokenCookieName,
    )?.value;

  if (!accessToken) {
    const loginUrl = new URL(
      "/login",
      request.url,
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/shipments/:path*",
    "/profile/:path*",
    "/statistics/:path*",
    "/exports/:path*",
  ],
};
