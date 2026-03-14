import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Client-side auth guard handles token checks via Zustand.
// This middleware ensures basic routing hygiene.
export function middleware(request: NextRequest) {
  // Let all requests through — auth is enforced client-side
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
