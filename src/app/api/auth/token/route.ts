import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      console.error('No code provided');
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const CLIENT_ID = '1594';
    const CLIENT_SECRET = 'J7LrFWdSoaUSOIVbtTZhtuaO8qsPvUh3Fv6HHho6';
    const REDIRECT_URI = `${request.headers.get('origin')}/auth/callback`;

    console.log('Token exchange request:', {
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code_length: code.length,
    });

    const tokenResponse = await fetch('https://auth.basalam.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    console.log('Basalam token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error:', tokenResponse.status, errorText);
      return NextResponse.json(
        { error: `Failed to exchange code for token: ${errorText}` },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('Token received successfully:', Object.keys(tokenData));

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
