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
      weight,
      primary_price,
      stock,
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
      description: description || '',
      attributes: attributes || [],
      category_id: category_id,
      status: 2976,
      preparation_days: preparation_days,
      package_weight: package_weight,
      weight: weight,
      primary_price: primary_price || 10000,
      stock: stock || 0,
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

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { detail: errorText };
      }

      let errorMessage = 'خطا در ایجاد محصول';

      if (response.status === 422) {
        if (errorData.messages && Array.isArray(errorData.messages)) {
          const duplicateMessage = errorData.messages.find((msg: any) =>
            msg.message && (
              msg.message.includes('تکراری') ||
              msg.message.includes('duplicate') ||
              msg.message.includes('already exists')
            )
          );

          if (duplicateMessage) {
            errorMessage = 'محصول تکراری است. این محصول قبلاً ثبت شده است.';
          } else {
            errorMessage = errorData.messages[0]?.message || errorMessage;
          }
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }

      return NextResponse.json(
        { error: errorMessage, details: errorData },
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
