import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json(
        { error: 'توکن احراز هویت الزامی است' },
        { status: 401 }
      );
    }

    console.log('Trying to fetch vendor profile with token');

    const response = await fetch('https://core.basalam.com/v3/users/me', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': token,
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.log('Failed with auth, trying without auth...');
      const response2 = await fetch('https://core.basalam.com/v3/users/me', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response2.ok) {
        const errorText = await response2.text();
        console.error('Vendor profile API error (no auth):', response2.status, errorText);
        return NextResponse.json(
          { error: 'خطا در دریافت اطلاعات فروشنده' },
          { status: response2.status }
        );
      }

      const data = await response2.json();
      console.log('Success without auth!');
      return NextResponse.json(data);
    }

    const data = await response.json();
    console.log('Success with auth!');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
