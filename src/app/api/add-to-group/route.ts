import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pgp_uuid, product_id } = await request.json();

    if (!pgp_uuid) {
      return NextResponse.json(
        { error: 'شناسه PGP الزامی است' },
        { status: 400 }
      );
    }

    if (!product_id) {
      return NextResponse.json(
        { error: 'شناسه محصول الزامی است' },
        { status: 400 }
      );
    }

    console.log('Adding product to PGP group:', {
      pgp_uuid,
      product_id
    });

    const response = await fetch(`https://pgp-service.basalam.com/v1/groups/${pgp_uuid}/add-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        product_id: product_id
      }),
    });

    console.log('Add to group response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Add to group API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'خطا در افزودن محصول به گروه', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Product added to group successfully:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
