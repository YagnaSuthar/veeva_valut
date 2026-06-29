import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8000';

// POST /api/auth  -> login, sets HttpOnly cookie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const res = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420'
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { ok: false, error: errData.detail || 'Invalid credentials' },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    // Set HttpOnly cookie with the JWT
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: 'access_token',
      value: data.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/auth  -> logout, clears cookie
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('access_token');
  return response;
}
