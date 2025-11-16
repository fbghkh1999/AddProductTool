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

    const body = await request.json();
    const {
      name,
      photoId,
      attributes,
      description,
      category_id,
      preparation_days,
      package_weight,
      primary_price,
      stock,
      weight,
      brief,
      is_wholesale,
      vendor_id,
    } = body;

    if (!vendor_id) {
      console.error('Vendor ID is missing!');
      return NextResponse.json(
        { error: 'شناسه فروشنده الزامی است' },
        { status: 400 }
      );
    }

    const vendorId = vendor_id;

    if (!photoId) {
      console.error('Photo ID is missing!');
      return NextResponse.json(
        { error: 'شناسه تصویر الزامی است' },
        { status: 400 }
      );
    }

    const productData = {
      name: name,
      photo: photoId,
      photos: [photoId],
      description: description || '',
      brief: brief || null,
      attributes: attributes || [],
      category_id: category_id,
      status: 2976,
      preparation_days: preparation_days,
      package_weight: package_weight,
      primary_price: primary_price || 10000,
      stock: stock || 0,
      weight: weight,
      is_wholesale: is_wholesale,
    };

    console.log('Product data being sent:', JSON.stringify(productData, null, 2));

    const response = await fetch(`https://core.basalam.com/v4/vendors/${vendorId}/products`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Basalam API Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'خطا در ایجاد محصول' },
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
