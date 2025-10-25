'use client';

import { useState, useEffect } from 'react';

interface IPFSImageProps {
  ipfsHash: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Image component that tries multiple IPFS gateways for better reliability
 */
export function IPFSImage({ ipfsHash, alt, className, fallback }: IPFSImageProps) {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [error, setError] = useState(false);
  
  const gateways = [
    `/api/ipfs/${ipfsHash}`, // Use Next.js proxy (no CORS issues!)
    `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${ipfsHash}`,
    `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
  ];

  useEffect(() => {
    console.log('🖼️ IPFSImage loading:', ipfsHash);
    setCurrentUrl(gateways[0]);
    setError(false);
  }, [ipfsHash]);

  const handleError = () => {
    console.error('❌ Failed to load from:', currentUrl);
    const currentIndex = gateways.indexOf(currentUrl);
    if (currentIndex < gateways.length - 1) {
      // Try next gateway
      console.log(`🔄 Trying next gateway: ${gateways[currentIndex + 1]}`);
      setCurrentUrl(gateways[currentIndex + 1]);
    } else {
      // All gateways failed
      console.error('❌ All IPFS gateways failed for hash:', ipfsHash);
      setError(true);
    }
  };

  if (error) {
    return fallback || (
      <div className={className + ' flex items-center justify-center bg-gray-900/50'}>
        <span className="text-gray-500 text-sm">Failed to load</span>
      </div>
    );
  }

  return (
    <img
      src={currentUrl}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
