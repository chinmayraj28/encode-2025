import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const hasUsedAssetABI = [
  {
    name: 'hasUsedAsset',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');
    const user = searchParams.get('user');

    if (!tokenId || !user) {
      return NextResponse.json(
        { error: 'Missing tokenId or user parameter' },
        { status: 400 }
      );
    }

    const hasPurchased = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: hasUsedAssetABI,
      functionName: 'hasUsedAsset',
      args: [BigInt(tokenId), user as `0x${string}`],
    } as any);

    return NextResponse.json({ hasPurchased });
  } catch (error) {
    console.error('Error checking purchase:', error);
    return NextResponse.json(
      { error: 'Failed to check purchase status' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
