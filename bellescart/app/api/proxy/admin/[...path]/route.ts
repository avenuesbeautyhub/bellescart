import { NextRequest, NextResponse } from 'next/server';
import { generateSignature, generateNonce, getTimestamp, isSensitiveEndpoint } from '@/lib/server/requestSigning';

// Get backend API URL from environment
// Prioritize PROD_BACKEND_API_URL if set, otherwise use DEV
const BACKEND_API_URL = process.env.PROD_BACKEND_API_URL || process.env.DEV_BACKEND_API_URL;

if (!BACKEND_API_URL) {
  throw new Error('Backend API URL not configured. Set DEV_BACKEND_API_URL or PROD_BACKEND_API_URL.');
}

/**
 * Next.js API Route Handler for proxying admin requests to backend
 * This runs on the server and adds HMAC signatures for sensitive endpoints
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'DELETE');
}

async function handleProxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
): Promise<NextResponse> {
  // Construct the backend URL outside try block for error logging
  const path = pathSegments.join('/');
  const backendUrl = `${BACKEND_API_URL}/${path}`;
  
  try {
    // Get request body
    let body: string | null = null;
    let contentType = request.headers.get('content-type') || '';
    
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (contentType.includes('application/json')) {
        body = await request.text();
      } else if (contentType.includes('multipart/form-data')) {
        
        // For FormData, we'll pass it through without signing
        // The backend middleware skips signing for FormData anyway
        const formData = await request.formData();
        const formDataResponse = await fetch(backendUrl, {
          method,
          headers: getForwardedHeaders(request),
          body: formData,
        });
        return await handleBackendResponse(formDataResponse);
      }
    }

    // Prepare headers
    const headers = getForwardedHeaders(request);

    // Add HMAC signature for sensitive endpoints
    const isSensitive = isSensitiveEndpoint(`/${path}`);
    if (isSensitive && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      try {
        const payload = body || '';
        const timestamp = getTimestamp();
        const nonce = generateNonce();
        const signature = generateSignature(payload, timestamp, nonce);

        headers['X-Signature'] = signature;
        headers['X-Timestamp'] = timestamp;
        headers['X-Nonce'] = nonce;
      } catch (error) {
        // Continue without signature if signing fails
      }
    }

    // Make the request to backend
    const backendResponse = await fetch(backendUrl, {
      method,
      headers,
      body: body || undefined,
    });

    return await handleBackendResponse(backendResponse);
  } catch (error) {
    console.error('[Admin Proxy] Error forwarding request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Proxy error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getForwardedHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // Forward all headers except host
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers[key] = value;
    }
  });

  return headers;
}

async function handleBackendResponse(response: Response): Promise<NextResponse> {
  const contentType = response.headers.get('content-type') || '';
  let body: any;

  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  const nextResponse = NextResponse.json(body, {
    status: response.status,
    statusText: response.statusText,
  });

  // Forward relevant headers
  const headersToForward = [
    'content-type',
    'set-cookie',
    'cache-control',
    'etag',
  ];

  headersToForward.forEach(header => {
    const value = response.headers.get(header);
    if (value) {
      nextResponse.headers.set(header, value);
    }
  });

  return nextResponse;
}
