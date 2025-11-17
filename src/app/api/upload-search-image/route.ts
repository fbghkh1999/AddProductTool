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
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'فایل الزامی است' },
        { status: 400 }
      );
    }

    console.log('Uploading search image to uploadio, size:', file.size, 'bytes');

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('file_type', 'pgp_search.photo');
    uploadFormData.append('thumbnail', '');
    uploadFormData.append('custom_unique_name', '');
    uploadFormData.append('expire_minutes', '');

    const response = await fetch('https://uploadio.basalam.com/api_v2/files', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': token,
      },
      body: uploadFormData,
    });

    console.log('Uploadio response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload API Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'خطا در آپلود تصویر' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Search image uploaded successfully, ID:', data.id);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
