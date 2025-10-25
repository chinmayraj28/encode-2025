'use client';

import { useState, useEffect, useRef } from 'react';

interface IPFSAudioProps {
  ipfsHash: string;
  className?: string;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Audio component that tries multiple IPFS gateways for better reliability
 */
export function IPFSAudio({ ipfsHash, className, controls = true, preload = 'none', onClick }: IPFSAudioProps) {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const gateways = [
    `/api/ipfs/${ipfsHash}`, // Use Next.js proxy (no CORS issues!)
    `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${ipfsHash}`,
    `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
  ];

  useEffect(() => {
    console.log('🎵 IPFSAudio loading:', ipfsHash);
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
    return (
      <div className={className + ' flex items-center justify-center bg-gray-900/50 p-2 rounded'}>
        <span className="text-gray-500 text-sm">Failed to load audio</span>
      </div>
    );
  }

  return (
    <audio
      ref={audioRef}
      controls={controls}
      className={className}
      preload={preload}
      onClick={onClick}
      onError={handleError}
    >
      <source src={currentUrl} type="audio/wav" />
      <source src={currentUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}
