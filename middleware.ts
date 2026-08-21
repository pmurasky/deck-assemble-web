import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';

export async function middleware(request: NextRequest) {
  try {
    return await auth0.middleware(request);
  } catch (error) {
    console.error('Auth0 middleware error on path:', request.nextUrl.pathname, error);
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_MIDDLEWARE_ERROR',
            message: 'Authentication session error in middleware',
          },
        },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
