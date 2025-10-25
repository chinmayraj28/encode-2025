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
export function IPFSAudio({ ipfsHash, className, controls = true, preload = 'metadata', onClick }: IPFSAudioProps) {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const maxRetries = 2; // Only try each gateway once
  
  const gateways = [
    `/api/ipfs/${ipfsHash}`, // Next.js proxy first (no CORS issues, with range support)
    `https://ipfs.io/ipfs/${ipfsHash}`, // Public IPFS gateway as fallback
  ];

  useEffect(() => {
    console.log('🎵 IPFSAudio loading:', ipfsHash);
    if (!ipfsHash || ipfsHash === '') {
      console.error('❌ No IPFS hash provided');
      setError(true);
      setErrorMessage('No preview available');
      setLoading(false);
      return;
    }
    
    // Reset retry count on hash change
    setRetryCount(0);
    
    // Debug: Test fetch the file to see what we get
    fetch(`/api/ipfs/${ipfsHash}`)
      .then(async (res) => {
        const contentType = res.headers.get('content-type');
        const contentLength = res.headers.get('content-length');
        console.log('📦 IPFS file info:', {
          status: res.status,
          contentType,
          contentLength,
          ok: res.ok
        });
        
        // If not an audio type, this is likely the problem
        if (contentType && !contentType.includes('audio') && !contentType.includes('octet-stream')) {
          console.error('⚠️ WARNING: File is not audio type:', contentType);
        }
        
        if (!res.ok) {
          console.error('❌ IPFS fetch failed:', res.status, res.statusText);
        }
      })
      .catch((err) => {
        console.error('❌ IPFS fetch error:', err);
      });
    
    setCurrentUrl(gateways[0]);
    setError(false);
    setErrorMessage('');
    setLoading(true);
  }, [ipfsHash]);

  const handleLoadedMetadata = () => {
    setLoading(false);
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      console.log('✅ Audio loaded:', {
        duration: duration,
        durationFormatted: `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`,
        src: currentUrl,
        readyState: audioRef.current.readyState,
        networkState: audioRef.current.networkState,
      });
      
      // Check if duration is valid
      if (!isFinite(duration) || duration === 0) {
        console.error('⚠️ Audio duration is 0 or invalid');
        setErrorMessage('Preview file may be corrupted');
      }
    }
  };

  const handleError = (e: any) => {
    // Prevent infinite retry loop
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    if (newRetryCount > maxRetries * gateways.length) {
      console.error('❌ Max retries exceeded, giving up');
      setError(true);
      setErrorMessage('Audio file could not be loaded after multiple attempts');
      setLoading(false);
      return;
    }
    
    console.error('❌ Audio error from:', currentUrl, `(attempt ${newRetryCount})`);
    
    // Add a small delay before checking error to ensure it's populated
    setTimeout(() => {
      if (audioRef.current?.error) {
        const errorCode = audioRef.current.error.code;
        const errorMessages = {
          1: 'MEDIA_ERR_ABORTED - Playback aborted by user',
          2: 'MEDIA_ERR_NETWORK - Network error occurred',
          3: 'MEDIA_ERR_DECODE - Audio decoding failed (corrupt or unsupported format)',
          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Audio format not supported'
        };
        console.error('Error details:', {
          code: errorCode,
          message: errorMessages[errorCode as keyof typeof errorMessages] || 'Unknown error',
          audioError: audioRef.current.error,
          networkState: audioRef.current?.networkState,
          readyState: audioRef.current?.readyState,
        });
      } else {
        console.error('No error object available - likely a CORS or network issue');
      }
    }, 100);
    
    const currentIndex = gateways.indexOf(currentUrl);
    if (currentIndex < gateways.length - 1 && newRetryCount <= maxRetries * gateways.length) {
      // Try next gateway
      console.log('🔄 Trying next gateway:', gateways[currentIndex + 1]);
      setCurrentUrl(gateways[currentIndex + 1]);
      setError(false);
    } else {
      // All gateways failed
      console.error('❌ All audio gateways failed for:', ipfsHash);
      
      // Provide specific error message based on error code
      let specificError = 'Failed to load audio from IPFS';
      if (audioRef.current?.error) {
        const code = audioRef.current.error.code;
        if (code === 3 || code === 4) {
          specificError = 'Preview file is corrupted or not a valid audio file. Try re-uploading.';
        } else if (code === 2) {
          specificError = 'Network error - IPFS gateways are slow or file is not pinned';
        }
      }
      
      setError(true);
      setErrorMessage(specificError);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className={className + ' flex items-center justify-center bg-gray-900/50 p-4 rounded'}>
        <div className="text-center">
          <span className="text-gray-500 text-sm block mb-2">⚠️ {errorMessage || 'Failed to load audio'}</span>
          <span className="text-xs text-gray-600 mb-3 block">Hash: {ipfsHash?.substring(0, 20)}...</span>
          <div className="space-y-2">
            <a 
              href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Try opening in IPFS directly
            </a>
            <button
              onClick={() => {
                setError(false);
                setRetryCount(0);
                setCurrentUrl(gateways[0]);
                setLoading(true);
              }}
              className="text-xs bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded z-10">
          <span className="text-sm text-gray-400">⏳ Loading audio...</span>
        </div>
      )}
      {errorMessage && !error && (
        <div className="mb-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded text-xs text-yellow-400 text-center">
          ⚠️ {errorMessage}
        </div>
      )}
      <audio
        key={currentUrl} // Force re-render when URL changes
        ref={audioRef}
        controls={controls}
        className={className}
        preload={preload}
        onClick={onClick}
        onError={handleError}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={() => {
          console.log('✅ Audio can play');
          setLoading(false);
        }}
        onLoadStart={() => {
          console.log('🔄 Audio load started');
        }}
      >
        <source src={currentUrl} />
        Your browser does not support the audio element.
      </audio>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Loading from: {currentUrl.includes('/api/ipfs/') ? 'Next.js Proxy' : 'IPFS Gateway'}
      </div>
    </div>
  );
}
