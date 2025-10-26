import { NextRequest, NextResponse } from 'next/server';
import { getMediaAssetsMinted, getAssetsByCreator } from '@/lib/graphql';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');

    let data;
    
    if (creator) {
      // Get assets by specific creator (no limit - get all their assets)
      data = await getAssetsByCreator(creator);
    } else {
      // Get all assets (no limit - pagination handled client-side)
      data = await getMediaAssetsMinted();
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching assets from Envio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}
