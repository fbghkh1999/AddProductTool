import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await context.params;

    const response = await fetch(`https://pgp-search.basalam.com/v1/groups/${uuid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxMSIsImp0aSI6IjkyZjRmMTJmMDRhYzM1OTEyNDdlOTYwNDIwZmUyZDQ2N2NmOWE5OTg1MDY0NDk4MDkxMDFjNDVjOTM4YjZiZDA1YjM2MWFkMTRjYmU1M2VjIiwiaWF0IjoxNzUyMjQ1NjczLjc1NzI5MSwibmJmIjoxNzUyMjQ1NjczLjc1NzI5NywiZXhwIjoxNzgzNzgxNjczLjcyNzIwMiwic3ViIjoiMTgyMzkzNDAiLCJzY29wZXMiOltdLCJ1c2VyX2lkIjoxODIzOTM0MH0.sQ4xGPjNutzxv4DpvZEUJldaWefIxJTlZOaESV83VUHTcJ1pQpRHcpng1bMvSeJwo-0N1SSNE5syuAi3YZe6WH9fCtQgSlmPH71X29yXnmGTa_mO5NlR2F76b7s7RmcRR48Z-bl-uyztJigYlA-copdT9wtjrYZg9TVBdxUICN7nTZMdaCEi_7QuPO_OOfLDkANTX4u5IlWxOORJfa58CsHG22o73ySxRowjC1cADfEXjLlyApMjlGpJ4PHaFrLBmRpdheBzriYJCDR8NU8pez4Ev9FZwW7LyQS3AiAYhopZQWcDb9HgYjExLANBrY6g2UDEUtQ_t9AmqUqaL9qLi-L3zM2UEPHbgo9C5rWY5X_IE-clwbWx8UAiPNUV1TYkDlq_Rcvd5Ds097psDntdbp63Ob8jmt4i0Tj7DXXnvxLqNQdjtHlJrKE_HiMVw60Tn_G_lwe59PuYud2dA1CdfdZqFSBSEMyQCx37AmM4Q9WORtWQf51wpS6lFnMNukMw2vhuf8zgvNxHFMUEbI2P9icnsPr46Zi-1vWzCXXkE26jEsSf9hsiaL2T8QdfyFfRg2oJT8SrU0DQXSnfTPMwBxchp_bMWp-JSqp66dCjpkCt21_g9uvhCAHWZoO_-ZwTmF_GDfRjYpmmLanucMWQ7fguuR-1CTYpr2D9hs_AkVg',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Basalam API Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'خطا در دریافت اطلاعات محصول' },
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
