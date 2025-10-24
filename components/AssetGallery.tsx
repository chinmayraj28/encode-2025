'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
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
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "useAsset",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getCollaborators",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "wallet", "type": "address" },
          { "internalType": "uint256", "name": "sharePercentage", "type": "uint256" }
        ],
        "internalType": "struct MediaAssetNFT.Collaborator[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

interface MediaAsset {
  tokenId: number;
  ipfsHash: string;
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
  const [selectedAsset, setSelectedAsset] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('0.001');

  // Get total number of assets
  const { data: totalAssets, refetch: refetchTotal } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTotalAssets',
  });

  // Write contract for purchasing
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

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

  const handleUseAsset = (tokenId: number) => {
    if (!CONTRACT_ADDRESS) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'useAsset',
      args: [BigInt(tokenId)],
      value: parseEther(paymentAmount),
    });
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType.toLowerCase()) {
      case 'audio': return '🎵';
      case 'visual': return '🎨';
      case 'vfx': return '✨';
      case 'sfx': return '🔊';
      default: return '📄';
    }
  };

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
              onUse={handleUseAsset}
              paymentAmount={paymentAmount}
              setPaymentAmount={setPaymentAmount}
              isPending={isPending}
              isConfirming={isConfirming}
            />
          ))
        )}
      </div>
    </div>
  );
}

function AssetCard({ 
  asset, 
  onUse, 
  paymentAmount, 
  setPaymentAmount,
  isPending,
  isConfirming
}: { 
  asset: MediaAsset;
  onUse: (tokenId: number) => void;
  paymentAmount: string;
  setPaymentAmount: (amount: string) => void;
  isPending: boolean;
  isConfirming: boolean;
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
      {/* Clickable Card Area */}
      <Link href={`/asset/${asset.tokenId}`} className="block mb-4">
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
          <p>Royalty: <span className="text-green-400">{Number(asset.royaltyPercentage) / 100}%</span></p>
          <p>Uses: <span className="text-blue-400">{asset.usageCount.toString()}</span></p>
          <p>Revenue: <span className="text-yellow-400">{formatEther(asset.totalRevenue)} ETH</span></p>
        </div>
        
        <div className="bg-purple-600/20 border border-purple-600 rounded-lg px-3 py-2 text-center group-hover:bg-purple-600/30 transition-colors">
          <span className="text-sm font-semibold">👁️ View Details & Preview</span>
        </div>
      </Link>

      {/* Quick Purchase Section */}
      <div className="border-t border-gray-700 pt-4">
        <label className="block text-xs text-gray-400 mb-2">Quick Purchase (ETH)</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.001"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            placeholder="0.001"
          />
          <button
            onClick={() => onUse(asset.tokenId)}
            disabled={isPending || isConfirming}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg font-semibold text-sm transition-all"
          >
            {isPending || isConfirming ? '⏳' : '💰 Use'}
          </button>
        </div>
      </div>
    </div>
  );
}
