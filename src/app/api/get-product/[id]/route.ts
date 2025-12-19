import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json(
        { error: 'توکن احراز هویت الزامی است' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    console.log('Fetching product details for ID:', id);

    const response = await fetch(`https://core.basalam.com/v4/products/${id}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': token,
      },
    });

    console.log('Get product response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get product API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'خطا در دریافت اطلاعات محصول' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Product details received:', JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
