import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

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

    // getSession will now use the cookie cache enabled in auth.ts
    // avoiding a database hit on every navigation.
    const session = await auth.api.getSession({
        headers: request.headers
    });

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