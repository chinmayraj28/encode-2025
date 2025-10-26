'use client';

import { useState, useEffect } from 'react';

interface AssetMetadata {
  name: string;
  description: string;
  mediaType: string;
  encryptedFileHash: string;
  previewHash: string;
  price: string;
  timestamp?: string;
  collaborators?: Array<{
    address: string;
    percentage: number;
  }>;
}

interface MintedAsset {
  id: string;
  tokenId: string;
  creator: string;
  ipfsHash: string;
  mediaType: string;
  previewHash: string; // Added from contract
  price: string; // Added from contract
  metadata: AssetMetadata | null;
}

interface TokenHistory {
  transfers: Array<{
    id: string;
    from: string;
    to: string;
    tokenId: string;
  }>;
  usage: Array<{
    id: string;
    tokenId: string;
    user: string;
    paymentAmount: string;
  }>;
  decryptionKeys: Array<{
    id: string;
    tokenId: string;
    buyer: string;
    decryptionKey: string;
  }>;
  royalties: Array<{
    id: string;
    tokenId: string;
    recipient: string;
    amount: string;
  }>;
}

/**
 * Hook to fetch indexed assets from Envio
 */
export function useIndexedAssets(creator?: string) {
  const [assets, setAssets] = useState<MintedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (creator) params.append('creator', creator);

      console.log('🔄 Fetching assets from Envio...', { creator });
      const response = await fetch(`/api/indexed-assets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch assets');
      
      const data = await response.json();
      const fetchedAssets = data.MediaAssetNFT_MediaAssetMinted || [];
      console.log(`✅ Fetched ${fetchedAssets.length} assets from Envio`);
      setAssets(fetchedAssets);
      setLastFetch(Date.now());
    } catch (err) {
      console.error('❌ Error fetching assets:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [creator]);

  return { assets, loading, error, refetch: fetchAssets, lastFetch };
}

/**
 * Hook to fetch token history from Envio
 */
export function useTokenHistory(tokenId: string | null) {
  const [history, setHistory] = useState<TokenHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenId) return;

    async function fetchHistory() {
      try {
        setLoading(true);
        const response = await fetch(`/api/token-history/${tokenId}`);
        if (!response.ok) throw new Error('Failed to fetch token history');
        
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [tokenId]);

  return { history, loading, error };
}
