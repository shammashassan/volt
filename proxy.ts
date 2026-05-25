import { NextRequest, NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isStaticAsset =
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname === "/favicon.ico" ||
        pathname === "/site.webmanifest" ||
        pathname.endsWith(".png");

    if (isStaticAsset) {
        return NextResponse.next();
    }

    // getCookieCache fetches the session from the client's cookie cache,
    // avoiding database connection establishment and query on every page navigation.
    const session = await getCookieCache(request);

    const isPublicPath =
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/pending-approval";

    if (!session) {
        if (isPublicPath) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Session exists, handle redirects
    const user = session.user as any;
    const isApproved = user.isApproved;
    const role = user.role;

    if (!isApproved) {
        if (pathname !== "/pending-approval" && !pathname.startsWith("/api/auth")) {
            return NextResponse.redirect(new URL("/pending-approval", request.url));
        }
        return NextResponse.next();
    }

    // Approved user
    if (pathname === "/pending-approval" || pathname === "/login") {
        return NextResponse.redirect(new URL("/explore", request.url));
    }

    if (pathname.startsWith("/users") && role !== "admin") {
        return NextResponse.redirect(new URL("/explore", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|site\\.webmanifest|.*\\.png).*)",
    ],
};