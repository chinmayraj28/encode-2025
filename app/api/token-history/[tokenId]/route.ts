import { NextRequest, NextResponse } from 'next/server';
import { getTokenHistory } from '@/lib/graphql';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    const tokenId = params.tokenId;
    const history = await getTokenHistory(tokenId);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching token history from Envio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token history' },
      { status: 500 }
    );
  }
}
