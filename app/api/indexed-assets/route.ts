import { NextRequest, NextResponse } from 'next/server';
import { getMediaAssetsMinted, getAssetsByCreator } from '@/lib/graphql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');
    const limit = parseInt(searchParams.get('limit') || '10');

    let data;
    
    if (creator) {
      // Get assets by specific creator
      data = await getAssetsByCreator(creator);
    } else {
      // Get all assets
      data = await getMediaAssetsMinted(limit);
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
