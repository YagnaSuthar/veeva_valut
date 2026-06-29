import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only intercept requests going to the backend proxy
  if (request.nextUrl.pathname.startsWith('/api/backend')) {
    const token = request.cookies.get('access_token')?.value;
    const requestHeaders = new Headers(request.headers);
    
    // Always bypass ngrok browser warning screen
    requestHeaders.set('ngrok-skip-browser-warning', '69420');
    
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/backend/:path*',
};
