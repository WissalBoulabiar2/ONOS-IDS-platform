import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const TOKEN_COOKIE = 'sdn_token';
const ROLE_COOKIE = 'sdn_role';
const protectedRoutes = [
  '/',
  '/dashboard',
  '/devices',
  '/topology',
  '/flows',
  '/alerts',
  '/services',
  '/configuration',
];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL(token ? '/dashboard' : '/login', request.url));
  }

  if (isProtectedPath(pathname) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
