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
    
    // Try multiple gateways
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      `https://ipfs.io/ipfs/${ipfsHash}`,
      `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
    ];

    let lastError: Error | null = null;

    for (const gateway of gateways) {
      try {
        const response = await fetch(gateway, {
          headers: {
            'Accept': '*/*',
          },
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type') || 'application/octet-stream';
          const buffer = await response.arrayBuffer();

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Access-Control-Allow-Origin': '*',
            },
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
