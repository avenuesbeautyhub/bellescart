import { NextRequest, NextResponse } from 'next/server';

// Get backend API URL from environment based on NODE_ENV
const BACKEND_API_URL = process.env.NODE_ENV === 'production'
  ? process.env.PROD_BACKEND_API_URL!
  : process.env.DEV_BACKEND_API_URL!;

if (!BACKEND_API_URL) {
  const envVar = process.env.NODE_ENV === 'production' ? 'PROD_BACKEND_API_URL' : 'DEV_BACKEND_API_URL';
  throw new Error(`Backend API URL not configured. Set ${envVar} in your environment.`);
}

export async function GET(request: NextRequest) {
  const backendUrl = `${BACKEND_API_URL}/csrf-token`;
  
  try {
    // Forward the request to backend
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward relevant headers
        'Origin': request.headers.get('origin') || '',
        'Referer': request.headers.get('referer') || '',
      },
    });

    const responseText = await backendResponse.text();
    let body: any;

    try {
      body = JSON.parse(responseText);
    } catch {
      body = responseText;
    }

    const nextResponse = NextResponse.json(body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // Forward relevant headers, especially Set-Cookie for CSRF token
    const headersToForward = [
      'content-type',
      'set-cookie',
      'cache-control',
      'etag',
    ];

    headersToForward.forEach(header => {
      const value = backendResponse.headers.get(header);
      if (value) {
        nextResponse.headers.set(header, value);
      }
    });

    return nextResponse;
  } catch (error) {
    console.error('[CSRF Token] Error forwarding request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'CSRF token error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
