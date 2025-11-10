import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');

    if (!title) {
      return NextResponse.json(
        { error: 'عنوان محصول الزامی است' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://categorydetection.basalam.com/category_detection/api_v1.0/predict/?title=${encodeURIComponent(title)}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Category Detection API Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'خطا در تشخیص دسته‌بندی' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Category detection response:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
