'use client';

import { useIndexedAssets } from '@/lib/hooks/useEnvioData';
import { useAccount, useReadContract } from 'wagmi';
import { useState, useMemo } from 'react';
import { IPFSImage } from './IPFSImage';
import { IPFSAudio } from './IPFSAudio';
import { formatEther } from 'viem';
import Link from 'next/link';

type ViewMode = 'all' | 'purchases';
type MediaFilter = 'all' | 'audio' | 'visual' | 'vfx' | 'sfx' | '3d';

interface IndexedAssetsGalleryProps {
  viewMode?: ViewMode;
  mediaFilter?: MediaFilter;
}

export default function IndexedAssetsGallery({ viewMode = 'all', mediaFilter = 'all' }: IndexedAssetsGalleryProps) {
  const { address } = useAccount();
  const [showMyAssets, setShowMyAssets] = useState(false);
  const [limit, setLimit] = useState(20);

  const creator = showMyAssets ? address : undefined;
  const { assets, loading, error } = useIndexedAssets(creator, limit);

  // Filter assets based on media type and view mode
  const filteredAssets = useMemo(() => {
    let filtered = [...assets];

    // Filter by media type
    if (mediaFilter !== 'all') {
      filtered = filtered.filter(asset => {
        const assetMediaType = (asset.mediaType || asset.metadata?.mediaType || '').toLowerCase();
        return assetMediaType === mediaFilter.toLowerCase();
      });
    }

    // For purchases view, we would need to check if user has purchased (hasUsedAsset)
    // This requires reading from the contract for each asset
    // For now, we'll show all assets in purchases mode and add a "Purchased" badge
    // A more complete implementation would fetch purchase data from Envio indexer

    return filtered;
  }, [assets, mediaFilter]);

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

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
        <p className="text-red-400">Error loading indexed assets: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
        <div>
          <h2 className="text-2xl font-bold text-white">⚡ Indexed Assets</h2>
          <p className="text-xs text-gray-400 mt-1">Powered by Envio • Lightning Fast Queries</p>
        </div>
        <div className="flex gap-2">
          {address && (
            <button
              onClick={() => setShowMyAssets(!showMyAssets)}
              className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                showMyAssets
                  ? 'bg-teal-500 text-white hover:bg-teal-600'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {showMyAssets ? '🌐 Show All' : '👤 My Assets'}
            </button>
          )}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-700/30 bg-gray-800/50 text-white focus:border-teal-500 focus:outline-none"
          >
            <option value={10}>10 assets</option>
            <option value={20}>20 assets</option>
            <option value={50}>50 assets</option>
            <option value={100}>100 assets</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mb-4"></div>
          <p className="text-gray-400 animate-pulse">Loading indexed assets...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-300 mb-2">
            {mediaFilter !== 'all' ? `No ${mediaFilter} assets found` : 'No indexed assets found'}
          </p>
          {showMyAssets && <p className="text-sm text-gray-400">Try minting some NFTs first!</p>}
          {mediaFilter !== 'all' && <p className="text-sm text-gray-400">Try selecting a different media type</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => {
              const metadata = asset.metadata;
              const mediaType = asset.mediaType || metadata?.mediaType || '';
              
              return (
                <div
                  key={asset.id}
                  className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl overflow-hidden hover:border-gray-600/50 transition-all group"
                >
                  <Link href={`/asset/${asset.tokenId}`} className="block">
                    {/* Preview Section */}
                    <div className="relative w-full h-48 bg-gray-900/50 flex items-center justify-center overflow-hidden">
                      {asset.previewHash ? (
                        mediaType.toLowerCase() === 'audio' || mediaType.toLowerCase() === 'sfx' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-900/50">
                            <span className="text-6xl mb-2">{getMediaIcon(mediaType)}</span>
                            <IPFSAudio 
                              ipfsHash={asset.previewHash}
                              className="w-full max-w-xs"
                              onClick={(e) => e.stopPropagation()}
                              preload="metadata"
                            />
                          </div>
                        ) : (
                          <IPFSImage 
                            ipfsHash={asset.previewHash}
                            alt={metadata?.name || `Token #${asset.tokenId}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            fallback={
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-6xl">{getMediaIcon(mediaType)}</span>
                              </div>
                            }
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl">{getMediaIcon(mediaType)}</span>
                        </div>
                      )}
                      
                      {/* Token ID Badge */}
                      <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 px-3 py-1 rounded-full text-xs font-bold text-gray-300">
                        #{asset.tokenId}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2 group-hover:text-teal-400 transition-colors line-clamp-2 text-white">
                        {metadata?.name || `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Asset`}
                      </h3>
                      
                      {metadata?.description && (
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {metadata.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-sm text-gray-400 mb-4">
                        <p>
                          <span className="inline-flex items-center">
                            <span className="mr-2">{getMediaIcon(mediaType)}</span>
                            <span className="text-gray-300 capitalize">{mediaType}</span>
                          </span>
                        </p>
                        <p>
                          Creator: <span className="text-teal-400">{formatAddress(asset.creator)}</span>
                        </p>
                        <p>
                          Price: <span className="text-green-400">
                            {asset.price ? `${formatEther(BigInt(asset.price))} ETH` : 'Not set'}
                          </span>
                        </p>
                      </div>

                      {/* Collaborators Section */}
                      {metadata?.collaborators && metadata.collaborators.length > 0 && (
                        <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
                          <p className="text-xs font-semibold text-gray-400 mb-2">🤝 Collaborators:</p>
                          <div className="flex flex-wrap gap-2">
                            {metadata.collaborators.map((collab, idx) => (
                              <span key={idx} className="text-xs bg-gray-800/50 text-gray-300 px-2 py-1 rounded border border-gray-700/30">
                                {formatAddress(collab.address)} ({collab.percentage}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Attributes */}
                      {metadata && (metadata as any).attributes && Array.isArray((metadata as any).attributes) && (metadata as any).attributes.length > 0 && (
                        <>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {((metadata as any).attributes as any[]).slice(0, 3).map((attr: any, idx: number) => (
                              <span key={idx} className="text-xs bg-gray-800/50 text-gray-300 px-2 py-1 rounded border border-gray-700/30">
                                {attr.trait_type}: {attr.value}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                      
                      <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg px-3 py-2 text-center group-hover:bg-teal-500/20 transition-colors">
                        <span className="text-sm font-semibold text-teal-400">👁️ View Details</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Footer Stats */}
          <div className="text-center text-sm text-gray-400 pt-4">
            <p>
              Showing <span className="text-teal-400 font-bold">{filteredAssets.length}</span> 
              {mediaFilter !== 'all' ? ` ${mediaFilter}` : ''} assets
              {showMyAssets && <span> created by you</span>}
              {mediaFilter !== 'all' && assets.length !== filteredAssets.length && (
                <span className="text-gray-500"> (filtered from {assets.length} total)</span>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
