import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json(
        { error: 'توکن احراز هویت الزامی است' },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    console.log('Searching PGP with image_id:', formData.get('image_id'));

    const response = await fetch('https://pgp-search.basalam.com/v1/search/multimodal', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Basalam API Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'خطا در دریافت اطلاعات از سرور' },
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
