import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/weight", "/diet", "/calculator", "/community", "/profile"]

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  if (protectedRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  if (pathname.startsWith("/auth") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
