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
    const imageUrl = formData.get('imageUrl') as string | null;

    let fileToUpload: File;
    let fileName = 'product.webp';
    let mimeType = 'image/webp';

    if (imageUrl) {
      console.log('Fetching image from URL:', imageUrl);
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        console.error('Failed to fetch image:', imageResponse.status);
        throw new Error('خطا در دریافت تصویر');
      }
      const imageBlob = await imageResponse.blob();
      console.log('Image blob size:', imageBlob.size, 'type:', imageBlob.type);

      // Detect proper MIME type from URL if blob type is binary/octet-stream
      if (imageBlob.type === 'binary/octet-stream' || !imageBlob.type.startsWith('image/')) {
        if (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg')) {
          mimeType = 'image/jpeg';
          fileName = 'product.jpg';
        } else if (imageUrl.includes('.png')) {
          mimeType = 'image/png';
          fileName = 'product.png';
        } else if (imageUrl.includes('.webp')) {
          mimeType = 'image/webp';
          fileName = 'product.webp';
        } else {
          mimeType = 'image/jpeg';
          fileName = 'product.jpg';
        }
      } else {
        mimeType = imageBlob.type;
        const ext = mimeType.split('/')[1] || 'jpg';
        fileName = `product.${ext}`;
      }

      fileToUpload = new File([imageBlob], fileName, { type: mimeType });
      console.log('Created file:', fileName, 'MIME:', mimeType, 'size:', fileToUpload.size);
    } else if (file) {
      fileToUpload = file;
      fileName = file.name;
      mimeType = file.type;
    } else {
      return NextResponse.json(
        { error: 'فایل یا آدرس تصویر الزامی است' },
        { status: 400 }
      );
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', fileToUpload);
    uploadFormData.append('file_type', 'product.photo');

    console.log('Uploading to uploadio with file_type: product.photo');

    const response = await fetch('https://uploadio.basalam.com/api_v1.0/store-file', {
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

    const responseText = await response.text();
    console.log('Uploadio raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Uploadio full response:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      return NextResponse.json(
        { error: 'پاسخ نامعتبر از سرور آپلود' },
        { status: 500 }
      );
    }

    // Extract from new API response format: { data: { files: [{ id, url, ... }] } }
    const files = data?.data?.files;
    if (!files || files.length === 0) {
      console.error('WARNING: No files in uploadio response!');
      return NextResponse.json(
        { error: 'فایلی در پاسخ سرور آپلود یافت نشد' },
        { status: 500 }
      );
    }

    const uploadedFile = files[0];
    const result = {
      id: uploadedFile.id,
      url: uploadedFile.url
    };

    console.log('Returning upload result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
