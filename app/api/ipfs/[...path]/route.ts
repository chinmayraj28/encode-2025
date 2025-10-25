import { NextRequest, NextResponse } from 'next/server';

/**
 * IPFS Proxy API Route
 * Proxies IPFS requests through Next.js backend to avoid CORS issues
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const ipfsHash = params.path.join('/');
    
    // Get Range header for audio/video streaming support
    const range = request.headers.get('range');
    
    // Try multiple gateways
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      `https://ipfs.io/ipfs/${ipfsHash}`,
      `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
    ];

    let lastError: Error | null = null;

    for (const gateway of gateways) {
      try {
        const headers: HeadersInit = {
          'Accept': '*/*',
        };
        
        // Forward range header for streaming support
        if (range) {
          headers['Range'] = range;
        }
        
        const response = await fetch(gateway, { headers });

        if (response.ok || response.status === 206) { // 206 = Partial Content
          const contentType = response.headers.get('content-type') || 'application/octet-stream';
          const buffer = await response.arrayBuffer();

          const responseHeaders: HeadersInit = {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Accept-Ranges': 'bytes', // Enable range requests
          };
          
          // Copy range-related headers if present
          if (response.headers.get('content-range')) {
            responseHeaders['Content-Range'] = response.headers.get('content-range')!;
          }
          if (response.headers.get('content-length')) {
            responseHeaders['Content-Length'] = response.headers.get('content-length')!;
          }
          
          // Don't cache for range requests, but cache for full requests
          if (range) {
            responseHeaders['Cache-Control'] = 'no-cache';
          } else {
            responseHeaders['Cache-Control'] = 'public, max-age=31536000, immutable';
          }

          return new NextResponse(buffer, {
            status: response.status === 206 ? 206 : 200,
            headers: responseHeaders,
          });
        }
      } catch (error) {
        lastError = error as Error;
        continue; // Try next gateway
      }
    }

    // All gateways failed
    return NextResponse.json(
      { error: 'Failed to fetch from IPFS', details: lastError?.message },
      { status: 502 }
    );
  } catch (error: any) {
    console.error('IPFS proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
