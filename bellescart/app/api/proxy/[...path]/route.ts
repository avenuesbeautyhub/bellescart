import { NextRequest, NextResponse } from 'next/server';
import { generateSignature, generateNonce, getTimestamp, isSensitiveEndpoint } from '@/lib/server/requestSigning';

// Get backend API URL from environment based on NODE_ENV
const BACKEND_API_URL = process.env.NODE_ENV === 'production'
  ? process.env.PROD_BACKEND_API_URL!
  : process.env.DEV_BACKEND_API_URL!;

if (!BACKEND_API_URL) {
  const envVar = process.env.NODE_ENV === 'production' ? 'PROD_BACKEND_API_URL' : 'DEV_BACKEND_API_URL';
  throw new Error(`Backend API URL not configured. Set ${envVar} in your environment.`);
}

/**
 * Next.js API Route Handler for proxying requests to backend
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
  
  // Preserve query parameters from the original request using Next.js URL object
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  const backendUrl = `${BACKEND_API_URL}/${path}${queryString}`;
  
  console.log('Proxy request details:');
  console.log('  Original URL:', request.url);
  console.log('  Path segments:', pathSegments);
  console.log('  Constructed path:', path);
  console.log('  Search params:', searchParams);
  console.log('  Query string:', queryString);
  console.log('  Backend URL:', backendUrl);
  console.log('  BACKEND_API_URL:', BACKEND_API_URL);
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
        console.log('FormData fetch to:', backendUrl);
        console.log('FormData entries:');
        for (const [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes, ${value.type})` : value);
        }

        const headers = getForwardedHeaders(request, true);
        // Remove content-length header to let fetch calculate it correctly for FormData
        delete headers['content-length'];
        console.log('Forwarded headers:', headers);

        // Node.js fetch requires duplex: 'half' for streaming bodies
        const formDataResponse = await fetch(backendUrl, {
          method,
          headers,
          body: formData as any,
          // @ts-ignore - duplex is required for Node.js fetch with streaming bodies
          duplex: 'half',
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
    console.error('Proxy request failed:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
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

function getForwardedHeaders(request: NextRequest, skipContentType = false): Record<string, string> {
  const headers: Record<string, string> = {};

  // Forward all headers except host and optionally content-type
  request.headers.forEach((value, key) => {
    const keyLower = key.toLowerCase();
    if (keyLower !== 'host' && !(skipContentType && keyLower === 'content-type')) {
      headers[key] = value;
    }
  });

  return headers;
}

async function handleBackendResponse(response: Response): Promise<NextResponse> {
  const contentType = response.headers.get('content-type') || '';
  let body: any;

  console.log('Backend response status:', response.status);
  console.log('Backend response content-type:', contentType);

  if (contentType.includes('application/json')) {
    body = await response.json();
    console.log('Backend response body:', body);
  } else {
    body = await response.text();
    console.log('Backend response text:', body);
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
