import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { SESSION_COOKIE } from '@/lib/auth/session'

export const config = {
  matcher: ['/admin/:path*'],
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (token) {
    const secret = process.env.AUTH_SECRET
    if (secret) {
      try {
        await jwtVerify(token, new TextEncoder().encode(secret))
        return NextResponse.next()
      } catch {
        // token invalide ou expiré -> redirection vers /login
      }
    }
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}
