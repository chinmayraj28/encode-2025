'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import Link from 'next/link';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// Contract ABI for reading
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
  },
  {
    "inputs": [],
    "name": "getTotalAssets",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

interface MediaAsset {
  tokenId: number;
  ipfsHash: string;
  previewHash: string;
  mediaType: string;
  uploadTimestamp: bigint;
  creator: string;
  royaltyPercentage: bigint;
  usageCount: bigint;
  totalRevenue: bigint;
}

export default function AssetGallery() {
  const { address, isConnected } = useAccount();
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  // Get total number of assets
  const { data: totalAssets, refetch: refetchTotal } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTotalAssets',
  });

  // Fetch all assets
  useEffect(() => {
    const fetchAssets = async () => {
      if (!totalAssets || !CONTRACT_ADDRESS) return;

      const fetchedAssets: MediaAsset[] = [];
      const total = Number(totalAssets);

      for (let i = 0; i < total; i++) {
        try {
          // This would ideally use multicall, but for simplicity we'll fetch one by one
          // In production, use wagmi's multicall or a subgraph
          const response = await fetch(`/api/asset/${i}`);
          if (response.ok) {
            const asset = await response.json();
            fetchedAssets.push({ ...asset, tokenId: i });
          }
        } catch (error) {
          console.error(`Error fetching asset ${i}:`, error);
        }
      }

      setAssets(fetchedAssets);
    };

    fetchAssets();
  }, [totalAssets]);

  if (!isConnected) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Connect your wallet to view the gallery</p>
      </div>
    );
  }

  if (!CONTRACT_ADDRESS) {
    return (
      <div className="text-center py-12 text-yellow-400">
        <p>⚠️ Contract not deployed. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <p className="text-lg">No assets yet. Be the first to upload! 🚀</p>
          </div>
        ) : (
          assets.map((asset) => (
            <AssetCard
              key={asset.tokenId}
              asset={asset}
            />
          ))
        )}
      </div>
    </div>
  );
}

function AssetCard({ 
  asset,
}: { 
  asset: MediaAsset;
}) {
  const getMediaIcon = (mediaType: string) => {
    switch (mediaType.toLowerCase()) {
      case 'audio': return '🎵';
      case 'visual': return '🎨';
      case 'vfx': return '✨';
      case 'sfx': return '🔊';
      default: return '📄';
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all group">
      <Link href={`/asset/${asset.tokenId}`} className="block">
        <div className="flex items-center justify-between mb-4">
          <span className="text-4xl group-hover:scale-110 transition-transform">{getMediaIcon(asset.mediaType)}</span>
          <span className="text-xs bg-purple-600 px-3 py-1 rounded-full">
            #{asset.tokenId}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-2 capitalize group-hover:text-purple-400 transition-colors">
          {asset.mediaType} Asset
        </h3>
        
        <div className="space-y-2 text-sm text-gray-400 mb-4">
          <p>Creator: <span className="text-purple-400">{formatAddress(asset.creator)}</span></p>
          <p>Uses: <span className="text-blue-400">{asset.usageCount.toString()}</span></p>
          <p>Revenue: <span className="text-yellow-400">{formatEther(asset.totalRevenue)} ETH</span></p>
        </div>
        
        <div className="bg-purple-600/20 border border-purple-600 rounded-lg px-3 py-2 text-center group-hover:bg-purple-600/30 transition-colors">
          <span className="text-sm font-semibold">👁️ View Details & Purchase</span>
        </div>
      </Link>
    </div>
  );
}
