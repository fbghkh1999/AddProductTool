import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
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
    const body = await request.json();

    console.log('Updating product:', id);
    console.log('Update data:', JSON.stringify(body, null, 2));

    const response = await fetch(`https://core.basalam.com/v4/products/${id}`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    });

    console.log('Update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update product API error:', response.status, errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText };
      }

      return NextResponse.json(
        { error: 'خطا در بروزرسانی محصول', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Product updated successfully:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
