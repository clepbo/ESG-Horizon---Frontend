import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    const protectedPaths = ["/admin", "/company", "/esg", "/dashboard"];

    if (
        protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path)) &&
        !token
    ) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/company/:path*",
        "/esg/:path*",
        "/dashboard/:path*",
    ],
};
