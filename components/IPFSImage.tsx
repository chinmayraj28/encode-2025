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
    `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    `https://ipfs.io/ipfs/${ipfsHash}`,
    `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
  ];

  useEffect(() => {
    setCurrentUrl(gateways[0]);
    setError(false);
  }, [ipfsHash]);

  const handleError = () => {
    const currentIndex = gateways.indexOf(currentUrl);
    if (currentIndex < gateways.length - 1) {
      // Try next gateway
      setCurrentUrl(gateways[currentIndex + 1]);
    } else {
      // All gateways failed
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
