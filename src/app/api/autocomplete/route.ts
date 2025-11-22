import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json(
        { error: 'توکن احراز هویت الزامی است' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '10';

    if (!query) {
      return NextResponse.json(
        { suggestions: [] }
      );
    }

    const response = await fetch(
      `https://pgp-search.basalam.com/v1/groups/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': token,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Basalam Autocomplete API Error:', response.status, errorText);
      return NextResponse.json(
        { suggestions: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { suggestions: [] },
      { status: 500 }
    );
  }
}
