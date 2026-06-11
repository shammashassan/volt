import { NextRequest, NextResponse } from "next/server";
import { getCookieCache, getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Safety fallback check matching the clean static bypass rules
    const isStaticAsset =
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes("."); // Catches all files with extensions (.ico, .xml, .png, etc.)

    if (isStaticAsset) {
        return NextResponse.next();
    }

    // Skip redirection check for Next.js Server Actions, allowing them to handle auth internally
    const isServerAction = request.headers.get("next-action") !== null;
    if (isServerAction) {
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
        // Fallback check: if the cookie cache is empty/expired, check if the session cookie itself exists
        const sessionCookie = getSessionCookie(request);

        if (sessionCookie) {
            // Allow the request to proceed. The Server Components / Page will validate it 
            // and automatically rebuild/refresh the client's cookie cache.
            return NextResponse.next();
        }

        if (isPublicPath) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Session exists, handle redirects
    const user = session.user as { isApproved?: boolean; role?: string };
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
    // Ultra-clean lookahead regex pattern optimization
    matcher: [
        "/((?!api(?:/|$)|_next/static|_next/image|.*\\..*).*)",
    ],
};