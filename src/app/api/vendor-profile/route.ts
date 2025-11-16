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

    const response = await fetch('https://core.basalam.com/v4/vendor/info', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vendor profile API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'خطا در دریافت اطلاعات فروشنده' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
