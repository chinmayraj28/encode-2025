'use client';

import { useState, useEffect } from 'react';

interface AssetMetadata {
  name: string;
  description: string;
  mediaType: string;
  encryptedFileHash: string;
  previewHash: string;
  price: string;
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
export function useIndexedAssets(creator?: string, limit: number = 10) {
  const [assets, setAssets] = useState<MintedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssets() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (creator) params.append('creator', creator);
        params.append('limit', limit.toString());

        const response = await fetch(`/api/indexed-assets?${params}`);
        if (!response.ok) throw new Error('Failed to fetch assets');
        
        const data = await response.json();
        setAssets(data.MediaAssetNFT_MediaAssetMinted || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
  }, [creator, limit]);

  return { assets, loading, error };
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
