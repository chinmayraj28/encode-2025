'use client';

import { useIndexedAssets } from '@/lib/hooks/useEnvioData';
import { useAccount, useReadContracts } from 'wagmi';
import { useState, useMemo, useEffect } from 'react';
import { IPFSImage } from './IPFSImage';
import { IPFSAudio } from './IPFSAudio';
import { formatEther } from 'viem';
import Link from 'next/link';

type MediaFilter = 'all' | 'audio' | 'visual' | 'vfx' | 'sfx' | '3d';

interface IndexedAssetsGalleryProps {
  mediaFilter?: MediaFilter;
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const hasUsedAssetABI = [
  {
    name: 'hasUsedAsset',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'user', type: 'address' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

export default function IndexedAssetsGallery({ mediaFilter = 'all' }: IndexedAssetsGalleryProps) {
  const { address } = useAccount();
  const [showMyAssets, setShowMyAssets] = useState(false); // Always starts false
  const [showPurchases, setShowPurchases] = useState(false); // Always starts false
  const [currentPage, setCurrentPage] = useState(1);
  const [purchasedTokenIds, setPurchasedTokenIds] = useState<Set<string>>(new Set());
  const [checkingPurchases, setCheckingPurchases] = useState(false);
  const assetsPerPage = 12; // Fixed number of assets per page

  const creator = showMyAssets ? address : undefined;
  const { assets, loading, error, refetch, lastFetch } = useIndexedAssets(creator); // Fetch all assets, pagination handled client-side

  // Auto-refresh every 30 seconds to catch newly indexed assets
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing assets...');
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  // Log filter state and asset fetching
  useEffect(() => {
    console.log('🔍 Filter State:', {
      showMyAssets,
      showPurchases,
      mediaFilter,
      creatorFilter: creator,
      connectedAddress: address
    });
  }, [showMyAssets, showPurchases, mediaFilter, creator, address]);

  // Log asset names when assets are fetched
  useEffect(() => {
    if (assets.length > 0) {
      console.log('\n📦 FETCHED ASSETS:');
      console.log('==================');
      assets.forEach((asset, index) => {
        const name = asset.metadata?.name || `Asset #${asset.tokenId}`;
        const mediaType = asset.mediaType || 'unknown';
        console.log(`${index + 1}. ${name} (${mediaType}) - Token #${asset.tokenId}`);
      });
      console.log(`\nTotal: ${assets.length} assets`);
      console.log('Filter applied:', showMyAssets ? 'My Assets' : 'All Assets');
      console.log('==================\n');
    } else if (!loading) {
      console.log('⚠️ No assets fetched. Filter state:', {
        showMyAssets,
        creator,
        address
      });
    }
  }, [assets, showMyAssets, loading, creator, address]);

  // Check which assets the user has purchased
  useEffect(() => {
    const checkPurchases = async () => {
      if (!address || !showPurchases || assets.length === 0) {
        setPurchasedTokenIds(new Set());
        return;
      }

      setCheckingPurchases(true);
      const purchased = new Set<string>();
      
      // Check each asset - note: this is a simplified version
      // In production, you'd want to batch these calls or use an indexer
      for (const asset of assets) {
        try {
          const response = await fetch(`/api/check-purchase?tokenId=${asset.tokenId}&user=${address}`);
          if (response.ok) {
            const data = await response.json();
            if (data.hasPurchased) {
              purchased.add(asset.tokenId);
            }
          }
        } catch (err) {
          console.error('Error checking purchase for token', asset.tokenId, err);
        }
      }
      
      setPurchasedTokenIds(purchased);
      setCheckingPurchases(false);
    };

    checkPurchases();
  }, [address, showPurchases, assets]);

  // Filter assets based on media type and purchase status
  const filteredAssets = useMemo(() => {
    let filtered = [...assets];

    // Filter by media type
    if (mediaFilter !== 'all') {
      filtered = filtered.filter(asset => {
        const assetMediaType = (asset.mediaType || asset.metadata?.mediaType || '').toLowerCase();
        return assetMediaType === mediaFilter.toLowerCase();
      });
    }

    // Filter by purchases
    if (showPurchases && address) {
      filtered = filtered.filter(asset => purchasedTokenIds.has(asset.tokenId));
    }

    return filtered;
  }, [assets, mediaFilter, showPurchases, address, purchasedTokenIds]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAssets.length / assetsPerPage);
  const startIndex = (currentPage - 1) * assetsPerPage;
  const endIndex = startIndex + assetsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [mediaFilter, showMyAssets, showPurchases]);

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

  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) return null;
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      // Relative time for uploads less than 24 hours old
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      // Absolute date for anything 24 hours or older
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return null;
    }
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
          <p className="text-xs text-gray-400 mt-1">
            Powered by Envio • Lightning Fast Queries
            {lastFetch > 0 && (
              <span className="ml-2">
                • Last updated: {new Date(lastFetch).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              refetch();
            }}
            disabled={loading}
            className="px-4 py-2 rounded-lg transition-all font-semibold bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh assets from Envio"
          >
            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
          {address && (
            <>
              <button
                onClick={() => {
                  setShowMyAssets(!showMyAssets);
                  if (!showMyAssets) setShowPurchases(false);
                }}
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  showMyAssets
                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {showMyAssets ? '🌐 Show All' : '👤 My Assets'}
              </button>
              <button
                onClick={() => {
                  setShowPurchases(!showPurchases);
                  if (!showPurchases) setShowMyAssets(false);
                }}
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  showPurchases
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {showPurchases ? '🌐 Show All' : '🛒 Your Purchases'}
              </button>
            </>
          )}
        </div>
      </div>

      {loading || (showPurchases && checkingPurchases) ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mb-4"></div>
          <p className="text-gray-400 animate-pulse">
            {showPurchases && checkingPurchases ? 'Checking your purchases...' : 'Loading indexed assets...'}
          </p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-300 mb-2">
            {mediaFilter !== 'all' ? `No ${mediaFilter} assets found` : 'No indexed assets found'}
          </p>
          {showMyAssets && <p className="text-sm text-gray-400">Try minting some NFTs first!</p>}
          {showPurchases && <p className="text-sm text-gray-400">You haven't purchased any assets yet!</p>}
          {mediaFilter !== 'all' && <p className="text-sm text-gray-400">Try selecting a different media type</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAssets.map((asset) => {
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
                        {metadata?.timestamp && (
                          <p className="flex items-center gap-1">
                            <span>📅</span>
                            <span className="text-gray-400">
                              Uploaded {formatDate(metadata.timestamp)}
                            </span>
                          </p>
                        )}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-800/50 text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                ← Previous
              </button>
              
              <div className="flex gap-2">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-4 py-2 rounded-lg bg-gray-800/50 text-white hover:bg-gray-700/50 transition-all"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="px-2 py-2 text-gray-500">...</span>
                    )}
                  </>
                )}

                {/* Page numbers around current page */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === currentPage || 
                           page === currentPage - 1 || 
                           page === currentPage + 1 ||
                           (currentPage <= 2 && page <= 3) ||
                           (currentPage >= totalPages - 1 && page >= totalPages - 2);
                  })
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                        currentPage === page
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-800/50 text-white hover:bg-gray-700/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="px-2 py-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-4 py-2 rounded-lg bg-gray-800/50 text-white hover:bg-gray-700/50 transition-all"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-800/50 text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                Next →
              </button>
            </div>
          )}

          {/* Footer Stats */}
          <div className="text-center text-sm text-gray-400 pt-4">
            <p>
              Showing <span className="text-teal-400 font-bold">{startIndex + 1}-{Math.min(endIndex, filteredAssets.length)}</span> of <span className="text-teal-400 font-bold">{filteredAssets.length}</span>
              {mediaFilter !== 'all' ? ` ${mediaFilter}` : ''} assets
              {showMyAssets && <span> created by you</span>}
              {showPurchases && <span> purchased by you</span>}
              {totalPages > 1 && (
                <span className="text-gray-500"> • Page {currentPage} of {totalPages}</span>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
