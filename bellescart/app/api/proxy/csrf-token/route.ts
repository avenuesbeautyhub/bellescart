import { NextRequest, NextResponse } from 'next/server';

// Get backend API URL from environment
const BACKEND_API_URL = process.env.PROD_BACKEND_API_URL || process.env.DEV_BACKEND_API_URL;

console.log('[CSRF Token] Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  DEV_BACKEND_API_URL: process.env.DEV_BACKEND_API_URL,
  PROD_BACKEND_API_URL: process.env.PROD_BACKEND_API_URL,
  FINAL_BACKEND_API_URL: BACKEND_API_URL
});

if (!BACKEND_API_URL) {
  throw new Error('Backend API URL not configured. Set DEV_BACKEND_API_URL or PROD_BACKEND_API_URL.');
}

export async function GET(request: NextRequest) {
  const backendUrl = `${BACKEND_API_URL}/csrf-token`;
  
  try {
    console.log(`[CSRF Token] GET ${backendUrl}`);

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

    console.log('[CSRF Token] Backend response:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
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

    console.log('[CSRF Token] Forwarded response with headers:', {
      contentType: nextResponse.headers.get('content-type'),
      hasSetCookie: !!nextResponse.headers.get('set-cookie'),
      setCookie: nextResponse.headers.get('set-cookie')
    });

    return nextResponse;
  } catch (error) {
    console.error('[CSRF Token] Error forwarding request:', error);
    console.error('[CSRF Token] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      backendUrl
    });
    return NextResponse.json(
      { 
        success: false, 
        error: 'CSRF token error',
        details: error instanceof Error ? error.message : 'Unknown error',
        backendUrl 
      },
      { status: 500 }
    );
  }
}
