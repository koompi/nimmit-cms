import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If the user is authenticated but doesn't have the right role, redirect them
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes protection
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN" && token?.role !== "EDITOR") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    // API Admin routes protection
    if (path.startsWith("/api/admin")) {
      if (token?.role !== "ADMIN" && token?.role !== "EDITOR") {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        )
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*"
  ]
}