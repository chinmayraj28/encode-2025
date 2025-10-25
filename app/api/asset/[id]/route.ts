import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, fallback } from 'viem';
import { sepolia } from 'viem/chains';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getMediaAsset",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "string", "name": "previewHash", "type": "string" },
          { "internalType": "string", "name": "mediaType", "type": "string" },
          { "internalType": "uint256", "name": "uploadTimestamp", "type": "uint256" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "usageCount", "type": "uint256" },
          { "internalType": "uint256", "name": "totalRevenue", "type": "uint256" }
        ],
        "internalType": "struct MediaAssetNFT.MediaAsset",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Create RPC endpoints with fallback to avoid rate limits
const RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_ALCHEMY_RPC || 'https://ethereum-sepolia-rpc.publicnode.com',
  'https://rpc.sepolia.org',
  'https://eth-sepolia.public.blastapi.io',
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://sepolia.gateway.tenderly.co',
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!CONTRACT_ADDRESS) {
      return NextResponse.json({ error: 'Contract not configured' }, { status: 500 });
    }

    // Use fallback transport with multiple RPC endpoints to handle rate limits
    const client = createPublicClient({
      chain: sepolia,
      transport: fallback(
        RPC_ENDPOINTS.map(url => http(url, {
          timeout: 10_000, // 10 second timeout
          retryCount: 2,
          retryDelay: 1000,
        }))
      ),
    });

    const tokenId = BigInt(params.id);
    
    try {
      const asset = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getMediaAsset',
        args: [tokenId],
      });

      // Also fetch tokenURI to get metadata
      const tokenURI = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'tokenURI',
        args: [tokenId],
      });

      return NextResponse.json({
        ipfsHash: asset.ipfsHash,
        previewHash: asset.previewHash,
        mediaType: asset.mediaType,
        uploadTimestamp: asset.uploadTimestamp.toString(),
        creator: asset.creator,
        price: asset.price.toString(),
        usageCount: asset.usageCount.toString(),
        totalRevenue: asset.totalRevenue.toString(),
        tokenURI: tokenURI,
      });
    } catch (contractError: any) {
      // Handle rate limit errors specifically
      if (contractError.message?.includes('429') || contractError.message?.includes('rate limit')) {
        console.error('⚠️ RPC rate limit hit, all fallbacks exhausted for asset:', params.id);
        return NextResponse.json({ 
          error: 'RPC rate limit exceeded. Please try again in a moment.',
          retryAfter: 5 
        }, { status: 429 });
      }
      
      // Handle token doesn't exist
      if (contractError.message?.includes('nonexistent token') || contractError.message?.includes('invalid token')) {
        return NextResponse.json({ 
          error: 'Asset not found' 
        }, { status: 404 });
      }
      
      throw contractError;
    }
  } catch (error: any) {
    console.error('❌ Error fetching asset:', params.id, error.message);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch asset data',
      details: error.shortMessage || undefined
    }, { status: 500 });
  }
}
