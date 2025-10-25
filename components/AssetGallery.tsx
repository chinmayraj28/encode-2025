'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import Link from 'next/link';
import { IPFSImage } from './IPFSImage';
import { IPFSAudio } from './IPFSAudio';

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
  price: bigint;
  usageCount: bigint;
  totalRevenue: bigint;
  title?: string;
  description?: string;
}

export default function AssetGallery() {
  const { address, isConnected, chain } = useAccount();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

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

      setIsLoading(true);
      setLoadingProgress(0);
      
      const fetchedAssets: MediaAsset[] = [];
      const total = Number(totalAssets);

      for (let i = 0; i < total; i++) {
        try {
          // Update progress
          setLoadingProgress(Math.round((i / total) * 100));
          
          // Fetch asset data from API
          const response = await fetch(`/api/asset/${i}`);
          if (response.ok) {
            const asset = await response.json();
            console.log(`📦 Asset ${i} data:`, asset);
            
            // Fetch metadata from IPFS to get title and description
            let title = undefined;
            let description = undefined;
            
            if (asset.tokenURI) {
              try {
                // Extract CID from ipfs:// URI
                const metadataCID = asset.tokenURI.replace('ipfs://', '');
                
                // Try multiple methods: proxy first, then direct gateways
                const urls = [
                  `/api/ipfs/${metadataCID}`, // Use Next.js proxy (no CORS!)
                  `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${metadataCID}`,
                  `https://gateway.pinata.cloud/ipfs/${metadataCID}`,
                ];

                for (const url of urls) {
                  try {
                    const metadataResponse = await fetch(url);
                    if (metadataResponse.ok) {
                      const metadata = await metadataResponse.json();
                      title = metadata.name;
                      description = metadata.description;
                      console.log(`✅ Metadata loaded for asset ${i}:`, { title, description });
                      break; // Success, exit loop
                    }
                  } catch (err) {
                    console.warn(`⚠️ Failed to load metadata from ${url}:`, err);
                    continue; // Try next URL
                  }
                }
              } catch (metadataError) {
                console.error(`❌ Error fetching metadata for asset ${i}:`, metadataError);
              }
            }
            
            fetchedAssets.push({ 
              ...asset, 
              tokenId: i,
              title,
              description
            });
          }
        } catch (error) {
          console.error(`Error fetching asset ${i}:`, error);
        }
      }

      setAssets(fetchedAssets);
      setLoadingProgress(100);
      setIsLoading(false);
    };

    fetchAssets();
  }, [totalAssets, CONTRACT_ADDRESS]);

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

  // Loading screen with progress
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8">
        {/* Animated icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-purple-600 rounded-full opacity-20 animate-ping"></div>
          <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-full">
            <svg 
              className="w-16 h-16 text-white animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">Loading Assets...</h3>
          <p className="text-gray-400">Fetching from blockchain and IPFS</p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md space-y-2">
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ease-out relative"
              style={{ width: `${loadingProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-400">
            {loadingProgress}% complete
          </p>
        </div>

        {/* Fun loading messages */}
        <div className="text-center text-sm text-purple-400 animate-pulse">
          {loadingProgress < 30 && "🔗 Connecting to blockchain..."}
          {loadingProgress >= 30 && loadingProgress < 60 && "📦 Fetching asset metadata..."}
          {loadingProgress >= 60 && loadingProgress < 90 && "🖼️ Loading previews from IPFS..."}
          {loadingProgress >= 90 && "✨ Almost there..."}
        </div>
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
      case '3d': return '🧊';
      default: return '📄';
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500 transition-all group">
      <Link href={`/asset/${asset.tokenId}`} className="block">
        {/* Preview Section */}
        <div className="relative w-full h-48 bg-gray-900/50 flex items-center justify-center overflow-hidden">
          {asset.mediaType.toLowerCase() === 'visual' || asset.mediaType.toLowerCase() === 'vfx' || asset.mediaType.toLowerCase() === '3d' ? (
            <IPFSImage
              ipfsHash={asset.previewHash}
              alt={asset.title || 'Asset preview'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">{getMediaIcon(asset.mediaType)}</span>
                </div>
              }
            />
          ) : asset.mediaType.toLowerCase() === 'audio' || asset.mediaType.toLowerCase() === 'sfx' ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
              <span className="text-6xl mb-2">{getMediaIcon(asset.mediaType)}</span>
              <IPFSAudio
                ipfsHash={asset.previewHash}
                className="w-full max-w-xs"
                onClick={(e) => e.stopPropagation()}
                preload="metadata"
              />
            </div>
          ) : (
            <span className="text-6xl">{getMediaIcon(asset.mediaType)}</span>
          )}
          
          {/* Token ID Badge */}
          <div className="absolute top-3 right-3 bg-purple-600 px-3 py-1 rounded-full text-xs font-bold">
            #{asset.tokenId}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
            {asset.title || `${asset.mediaType.charAt(0).toUpperCase() + asset.mediaType.slice(1)} Asset`}
          </h3>
          
          {asset.description && (
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {asset.description}
            </p>
          )}
          
          <div className="space-y-2 text-sm text-gray-400 mb-4">
            <p>📅 <span className="text-gray-300">{formatDate(asset.uploadTimestamp)}</span></p>
            <p>Creator: <span className="text-purple-400">{formatAddress(asset.creator)}</span></p>
            <p>Price: <span className="text-green-400">{formatEther(asset.price || BigInt(0))} ETH</span></p>
            <p>Uses: <span className="text-blue-400">{asset.usageCount.toString()}</span></p>
          </div>
          
          <div className="bg-purple-600/20 border border-purple-600 rounded-lg px-3 py-2 text-center group-hover:bg-purple-600/30 transition-colors">
            <span className="text-sm font-semibold">👁️ View Details & Purchase</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
