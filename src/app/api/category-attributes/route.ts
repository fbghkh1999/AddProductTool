import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'شناسه دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }

    const vendorId = 1267234;
    const url = `https://core.basalam.com/api_v2/category/${categoryId}/attributes?vendor_id=${vendorId}&exclude_multi_selects=true`;

    console.log('Fetching category attributes from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Category attributes API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'خطا در دریافت ویژگی‌های دسته‌بندی' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Category attributes received:', JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
