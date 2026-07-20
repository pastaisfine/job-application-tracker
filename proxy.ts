import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth/auth";

export async function proxy(request: NextRequest) {
    // Better Auth API getSession called directly with request headers.
    // This is safe in proxy.ts because proxy.ts runs in the Node.js runtime.
    const session = await auth.api.getSession({
        headers: request.headers
    });

    const isSignInPage = request.nextUrl.pathname.startsWith("/sign-in");
    const isSignUpPage = request.nextUrl.pathname.startsWith("/sign-up");
    const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

    // Redirect authenticated users away from sign-in/sign-up pages
    if ((isSignInPage || isSignUpPage) && session?.user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Protect dashboard and redirect unauthenticated users to sign-in
    if (isDashboardPage && !session?.user) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

// Config to specify which paths the proxy runs on
export const config = {
    matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"]
};


