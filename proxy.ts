import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isPublicPath = 
        pathname === "/" || 
        pathname === "/login" || 
        pathname === "/pending-approval" ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") || 
        pathname.startsWith("/api") ||
        pathname === "/favicon.ico";

    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session && !isPublicPath) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session) {
        const user = session.user as any;
        const isApproved = user.isApproved;
        const role = user.role;

        if (!isApproved && pathname !== "/pending-approval" && !pathname.startsWith("/api/auth")) {
            return NextResponse.redirect(new URL("/pending-approval", request.url));
        }

        if (isApproved && pathname === "/pending-approval") {
            return NextResponse.redirect(new URL("/explore", request.url));
        }

        if (isApproved && pathname === "/login") {
            return NextResponse.redirect(new URL("/explore", request.url));
        }

        if (pathname.startsWith("/users") && role !== "admin") {
            return NextResponse.redirect(new URL("/explore", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
