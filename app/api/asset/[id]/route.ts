import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// Custom localhost chain for Hardhat
const localhost = {
  id: 31337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
};

const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getMediaAsset",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "string", "name": "mediaType", "type": "string" },
          { "internalType": "uint256", "name": "uploadTimestamp", "type": "uint256" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "uint256", "name": "royaltyPercentage", "type": "uint256" },
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
  }
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!CONTRACT_ADDRESS) {
      return NextResponse.json({ error: 'Contract not configured' }, { status: 500 });
    }

    const client = createPublicClient({
      chain: localhost, // Use localhost for local development
      transport: http(),
    });

    const tokenId = BigInt(params.id);
    
    const asset = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getMediaAsset',
      args: [tokenId],
    });

    return NextResponse.json({
      ipfsHash: asset.ipfsHash,
      mediaType: asset.mediaType,
      uploadTimestamp: asset.uploadTimestamp.toString(),
      creator: asset.creator,
      royaltyPercentage: asset.royaltyPercentage.toString(),
      usageCount: asset.usageCount.toString(),
      totalRevenue: asset.totalRevenue.toString(),
    });
  } catch (error: any) {
    console.error('Error fetching asset:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
