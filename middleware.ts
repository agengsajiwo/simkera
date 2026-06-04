import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const email = token?.email || ""

    if (!email.endsWith("@unu-jogja.ac.id")) {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|images|uploads).*)",
  ],
}
