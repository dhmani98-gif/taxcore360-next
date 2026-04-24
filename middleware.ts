import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './src/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api') && !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname === '/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
