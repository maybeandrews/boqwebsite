// middleware.ts

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// At the top of your middleware.ts
console.log("🚀 Middleware module loaded");

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Debug - Log every request
    console.log(`🔒 Middleware checking: ${path}`);

    // Check if path is public
    const isPublicPath =
        path === "/login" ||
        path === "/" ||
        path.startsWith("/api/") ||
        path.includes("favicon") ||
        path.includes("_next");

    console.log(`📍 Path ${path} is public? ${isPublicPath}`);

    // Get token and log it (with sensitive data removed)
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    console.log(`🔑 Token exists: ${!!token}`);
    if (token) {
        console.log(`👤 User: ${token.username || "unknown"}`);
    }

    // Handle authentication
    if (!isPublicPath && !token) {
        console.log(
            `🚫 Redirecting unauthenticated user from ${path} to /login`
        );
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Handle admin routes
    if (path.startsWith("/admin")) {
        console.log(`👑 Admin route check: ${path}`);
        if (token?.username !== "admin") {
            console.log(`⛔ Non-admin user attempted to access ${path}`);
            return NextResponse.redirect(
                new URL("/client/dashboard", request.url)
            );
        }
        console.log(`✅ Admin access granted to ${path}`);
    }

    // Already logged in check
    if (path === "/login" && token) {
        const redirectUrl =
            token.username === "admin"
                ? "/admin/dashboard"
                : "/client/dashboard";
        console.log(`🔄 Already logged in. Redirecting to ${redirectUrl}`);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    console.log(`✅ Access granted to ${path}`);
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Protected routes
        "/admin/:path*",
        "/client/:path*",
        // Login page (for already logged in redirect)
        "/login",
    ],
};
