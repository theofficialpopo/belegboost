import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  let subdomain = '';

  // Development: [tenant].localhost:3000
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');

    // If just "localhost:3000" -> main site
    // If "tenant.localhost:3000" -> tenant site
    if (parts.length > 1 && parts[0] !== 'localhost') {
      subdomain = parts[0];
    }
  }
  // Production: [tenant].belegboost.de or www.belegboost.de
  else if (hostname.includes('belegboost.de')) {
    const parts = hostname.split('.');

    // www.belegboost.de or belegboost.de -> main site
    if (parts[0] === 'www' || parts.length === 2) {
      subdomain = '';
    }
    // [tenant].belegboost.de -> tenant site
    else if (parts.length === 3) {
      subdomain = parts[0];
    }
  }

  // Main domain (no subdomain) - show landing page
  if (!subdomain) {
    return NextResponse.next();
  }

  // Rewrite to tenant routes: /tenants/[tenant]/...
  url.pathname = `/tenants/${subdomain}${url.pathname}`;

  return NextResponse.rewrite(url);
}
