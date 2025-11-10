import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // OAuth disabled - using hardcoded token
    // const token = request.headers.get('Authorization');
    // if (!token) {
    //   return NextResponse.json(
    //     { error: 'توکن احراز هویت الزامی است' },
    //     { status: 401 }
    //   );
    // }
    const token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxMSIsImp0aSI6IjkyZjRmMTJmMDRhYzM1OTEyNDdlOTYwNDIwZmUyZDQ2N2NmOWE5OTg1MDY0NDk4MDkxMDFjNDVjOTM4YjZiZDA1YjM2MWFkMTRjYmU1M2VjIiwiaWF0IjoxNzUyMjQ1NjczLjc1NzI5MSwibmJmIjoxNzUyMjQ1NjczLjc1NzI5NywiZXhwIjoxNzgzNzgxNjczLjcyNzIwMiwic3ViIjoiMTgyMzkzNDAiLCJzY29wZXMiOltdLCJ1c2VyX2lkIjoxODIzOTM0MH0.sQ4xGPjNutzxv4DpvZEUJldaWefIxJTlZOaESV83VUHTcJ1pQpRHcpng1bMvSeJwo-0N1SSNE5syuAi3YZe6WH9fCtQgSlmPH71X29yXnmGTa_mO5NlR2F76b7s7RmcRR48Z-bl-uyztJigYlA-copdT9wtjrYZg9TVBdxUICN7nTZMdaCEi_7QuPO_OOfLDkANTX4u5IlWxOORJfa58CsHG22o73ySxRowjC1cADfEXjLlyApMjlGpJ4PHaFrLBmRpdheBzriYJCDR8NU8pez4Ev9FZwW7LyQS3AiAYhopZQWcDb9HgYjExLANBrY6g2UDEUtQ_t9AmqUqaL9qLi-L3zM2UEPHbgo9C5rWY5X_IE-clwbWx8UAiPNUV1TYkDlq_Rcvd5Ds097psDntdbp63Ob8jmt4i0Tj7DXXnvxLqNQdjtHlJrKE_HiMVw60Tn_G_lwe59PuYud2dA1CdfdZqFSBSEMyQCx37AmM4Q9WORtWQf51wpS6lFnMNukMw2vhuf8zgvNxHFMUEbI2P9icnsPr46Zi-1vWzCXXkE26jEsSf9hsiaL2T8QdfyFfRg2oJT8SrU0DQXSnfTPMwBxchp_bMWp-JSqp66dCjpkCt21_g9uvhCAHWZoO_-ZwTmF_GDfRjYpmmLanucMWQ7fguuR-1CTYpr2D9hs_AkVg';

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
    uploadFormData.append('thumbnail', '');
    uploadFormData.append('custom_unique_name', '');
    uploadFormData.append('expire_minutes', '');

    console.log('Uploading to uploadio with file_type: product.photo');

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

    const responseText = await response.text();
    console.log('Uploadio raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Uploadio full response:', JSON.stringify(data, null, 2));
      console.log('Photo ID from uploadio:', data.id);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      return NextResponse.json(
        { error: 'پاسخ نامعتبر از سرور آپلود' },
        { status: 500 }
      );
    }

    if (!data.id) {
      console.error('WARNING: No ID in uploadio response!');
      return NextResponse.json(
        { error: 'شناسه تصویر دریافت نشد' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
