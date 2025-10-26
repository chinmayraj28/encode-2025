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
 * Also detects if the preview is actually a video file and displays it accordingly
 */
export function IPFSImage({ ipfsHash, alt, className, fallback }: IPFSImageProps) {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [error, setError] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const gateways = [
    `/api/ipfs/${ipfsHash}`, // Use Next.js proxy (no CORS issues!)
    `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${ipfsHash}`,
    `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
  ];

  useEffect(() => {
    console.log('🖼️ IPFSImage loading:', ipfsHash);
    setCurrentUrl(gateways[0]);
    setError(false);
    setIsVideo(false);
    setRetryCount(0);
    
    // Check content type to see if this is actually a video
    fetch(`/api/ipfs/${ipfsHash}`, { method: 'HEAD' })
      .then(response => {
        const contentType = response.headers.get('content-type');
        if (contentType?.startsWith('video/')) {
          console.log('⚠️ Preview is a video file, not an image. Switching to video player.');
          setIsVideo(true);
        }
      })
      .catch(err => {
        console.warn('Could not check content type:', err);
      });
  }, [ipfsHash]);

  const handleError = () => {
    console.error('❌ Failed to load from:', currentUrl);
    const currentIndex = gateways.indexOf(currentUrl);
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    if (currentIndex < gateways.length - 1 && newRetryCount <= gateways.length * 2) {
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
      <div className={className + ' flex flex-col items-center justify-center bg-gray-900/50 p-4'}>
        <span className="text-gray-500 text-sm mb-2">⚠️ Preview failed to load</span>
        <span className="text-xs text-gray-600">This may be an old asset with invalid preview</span>
        <a 
          href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-400 hover:text-purple-300 underline mt-2"
        >
          Try opening directly
        </a>
      </div>
    );
  }

  // If it's actually a video file (old upload), display as video
  if (isVideo) {
    return (
      <div className={className + ' flex flex-col items-center justify-center bg-gray-900/50 p-4'}>
        <video
          key={currentUrl}
          controls
          className="w-full max-h-full rounded"
          onError={handleError}
        >
          <source src={currentUrl} />
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  return (
    <img
      key={currentUrl}
      src={currentUrl}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
