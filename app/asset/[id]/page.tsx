'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useWatchContractEvent } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import Link from 'next/link';
import { decryptFile, downloadDecryptedFile } from '@/lib/encryption';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "useAsset",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getDecryptionKey",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "decryptionKey", "type": "string" }
    ],
    "name": "DecryptionKeyReleased",
    "type": "event"
  }
] as const;

interface MediaAsset {
  tokenId: number;
  ipfsHash: string;
  previewHash: string;
  mediaType: string;
  uploadTimestamp: bigint;
  creator: string;
  royaltyPercentage: bigint;
  usageCount: bigint;
  totalRevenue: bigint;
}

export default function AssetPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('0.001');
  const [metadata, setMetadata] = useState<any>(null);
  const [decryptionKey, setDecryptionKey] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionStatus, setDecryptionStatus] = useState<string>('');

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const tokenId = params.id as string;

  // Check if user already has access to decryption key
  const { data: existingKey } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getDecryptionKey',
    args: [BigInt(tokenId)],
    account: address,
  });

  // Watch for DecryptionKeyReleased event
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'DecryptionKeyReleased',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.buyer === address && log.args.tokenId === BigInt(tokenId)) {
          console.log('🔑 Decryption key received:', log.args.decryptionKey);
          setDecryptionKey(log.args.decryptionKey || '');
          setDecryptionStatus('✅ Decryption key received! You can now download the full file.');
        }
      });
    },
  });

  // Load existing key if user has already purchased
  useEffect(() => {
    if (existingKey && typeof existingKey === 'string' && existingKey.length > 0) {
      setDecryptionKey(existingKey);
      setDecryptionStatus('✅ You have access to this asset!');
    }
  }, [existingKey]);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await fetch(`/api/asset/${tokenId}`);
        if (response.ok) {
          const data = await response.json();
          setAsset({ ...data, tokenId: Number(tokenId) });

          // Fetch IPFS metadata
          try {
            const metadataResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${data.ipfsHash}`);
            if (metadataResponse.ok) {
              const metadataJson = await metadataResponse.json();
              setMetadata(metadataJson);
            }
          } catch (err) {
            console.error('Error fetching metadata:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching asset:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [tokenId]);

  const handleUseAsset = () => {
    if (!CONTRACT_ADDRESS || !asset) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'useAsset',
      args: [BigInt(asset.tokenId)],
      value: parseEther(paymentAmount),
    });
  };

  const handleDecryptAndDownload = async () => {
    if (!asset || !decryptionKey) {
      setDecryptionStatus('❌ No decryption key available');
      return;
    }

    try {
      setIsDecrypting(true);
      setDecryptionStatus('📥 Downloading encrypted file from IPFS...');

      // Download encrypted file from IPFS
      const encryptedFileUrl = `https://gateway.pinata.cloud/ipfs/${asset.ipfsHash}`;
      const response = await fetch(encryptedFileUrl);
      
      if (!response.ok) {
        throw new Error('Failed to download encrypted file');
      }

      const encryptedBlob = await response.blob();
      setDecryptionStatus('🔓 Decrypting file...');

      // Decrypt the file
      const mimeType = metadata?.mimeType || 'application/octet-stream';
      const decryptedBlob = await decryptFile(encryptedBlob, decryptionKey, mimeType);

      setDecryptionStatus('💾 Downloading decrypted file...');

      // Download the decrypted file
      const fileName = metadata?.name || `asset-${asset.tokenId}`;
      downloadDecryptedFile(decryptedBlob, fileName);

      setDecryptionStatus('✅ File decrypted and downloaded successfully!');
      
      // Clear status after 5 seconds
      setTimeout(() => setDecryptionStatus(''), 5000);
    } catch (error: any) {
      console.error('Decryption error:', error);
      setDecryptionStatus(`❌ Decryption failed: ${error.message}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType.toLowerCase()) {
      case 'audio': return '🎵';
      case 'visual': return '🎨';
      case 'vfx': return '✨';
      case 'sfx': return '🔊';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-2xl">⏳ Loading asset...</div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">❌ Asset Not Found</h1>
          <Link href="/" className="text-purple-400 hover:underline">← Back to Gallery</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-sm bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300">
            ← Back to Gallery
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Preview */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Asset Preview</h2>
                <span className="text-6xl">{getMediaIcon(asset.mediaType)}</span>
              </div>

              {/* IPFS File Preview - Using previewHash for preview */}
              <MediaPreview 
                ipfsHash={asset.previewHash || asset.ipfsHash} 
                mediaType={asset.mediaType}
                metadata={metadata}
              />

              {/* IPFS Links */}
              <div className="mt-6 space-y-2">
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${asset.previewHash || asset.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-center font-semibold transition-all"
                >
                  🔗 Open Preview in IPFS
                </a>
                {decryptionKey && (
                  <button
                    onClick={handleDecryptAndDownload}
                    disabled={isDecrypting}
                    className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-center font-semibold transition-all"
                  >
                    {isDecrypting ? '⏳ Decrypting...' : '� Download Full Version (Decrypted)'}
                  </button>
                )}
              </div>

              {/* Decryption Status */}
              {decryptionStatus && (
                <div className={`mt-4 p-4 rounded-lg ${
                  decryptionStatus.includes('❌') ? 'bg-red-900/50 border border-red-700' : 
                  decryptionStatus.includes('✅') ? 'bg-green-900/50 border border-green-700' :
                  'bg-blue-900/50 border border-blue-700'
                }`}>
                  <p className="text-sm text-center">{decryptionStatus}</p>
                </div>
              )}
            </div>

            {/* Metadata Card */}
            {metadata && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">📝 Metadata</h3>
                <div className="space-y-2 text-sm">
                  {metadata.name && <p><span className="text-gray-400">Name:</span> <span className="font-semibold">{metadata.name}</span></p>}
                  {metadata.description && <p><span className="text-gray-400">Description:</span> <span>{metadata.description}</span></p>}
                  {metadata.attributes && (
                    <div className="mt-4">
                      <p className="text-gray-400 mb-2">Attributes:</p>
                      <div className="space-y-1">
                        {metadata.attributes.map((attr: any, idx: number) => (
                          <p key={idx} className="ml-4">
                            <span className="text-purple-400">{attr.trait_type}:</span> {attr.value}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Asset Details */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold capitalize">{asset.mediaType} Asset</h1>
                <span className="text-lg bg-purple-600 px-4 py-2 rounded-full">
                  #{asset.tokenId}
                </span>
              </div>

              <div className="space-y-4">
                <InfoRow label="Creator" value={asset.creator} isAddress />
                <InfoRow label="Royalty Fee" value={`${Number(asset.royaltyPercentage) / 100}%`} highlight="green" />
                <InfoRow label="Total Uses" value={asset.usageCount.toString()} highlight="blue" />
                <InfoRow label="Total Revenue" value={`${formatEther(asset.totalRevenue)} ETH`} highlight="yellow" />
                <InfoRow 
                  label="Upload Date" 
                  value={new Date(Number(asset.uploadTimestamp) * 1000).toLocaleString()} 
                />
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">IPFS Hash:</p>
                  <p className="text-xs bg-gray-900 px-3 py-2 rounded font-mono break-all">
                    {asset.ipfsHash}
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase/Use Card */}
            {isConnected ? (
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-700 rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-4">
                  {decryptionKey ? '✅ You Own This Asset' : '💰 Purchase This Asset'}
                </h3>
                
                {decryptionKey ? (
                  <div className="space-y-4">
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                      <p className="text-green-400 font-semibold mb-2">🔑 Access Granted!</p>
                      <p className="text-sm text-gray-300 mb-4">
                        You have purchased this asset and can now download the full, unencrypted version.
                      </p>
                      <button
                        onClick={handleDecryptAndDownload}
                        disabled={isDecrypting}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-bold transition-all"
                      >
                        {isDecrypting ? '⏳ Decrypting...' : '🔓 Download Full File'}
                      </button>
                    </div>
                    
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-2">Your Decryption Key:</p>
                      <p className="text-xs font-mono bg-gray-800 px-3 py-2 rounded break-all">
                        {decryptionKey.substring(0, 32)}...
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 This key is stored securely in the smart contract
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-300 mb-6">
                      Purchase this encrypted asset. Upon payment, you'll receive the decryption key to unlock the full file.
                    </p>

                    <div className="space-y-4">
                      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                        <p className="text-blue-400 font-semibold mb-2">🔒 File Protection</p>
                        <p className="text-sm text-gray-300">
                          The full file is encrypted with AES-256. Only buyers receive the decryption key stored in the smart contract.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Payment Amount (ETH)</label>
                        <input
                          type="number"
                          step="0.001"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                          placeholder="0.001"
                        />
                      </div>

                      <button
                        onClick={handleUseAsset}
                        disabled={isPending || isConfirming}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg font-bold text-lg transition-all"
                      >
                        {isPending ? '⏳ Confirming...' : isConfirming ? '⏳ Processing...' : '🚀 Purchase & Get Decryption Key'}
                      </button>

                      {isSuccess && !decryptionKey && (
                        <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 text-center">
                          ⏳ Transaction successful! Waiting for decryption key...
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-gray-400 mb-4">Connect your wallet to purchase this asset</p>
                <Link href="/" className="text-purple-400 hover:underline">
                  Go to home page to connect
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function MediaPreview({ ipfsHash, mediaType, metadata }: { ipfsHash: string; mediaType: string; metadata: any }) {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    // Try to get the actual file URL from metadata
    if (metadata?.image) {
      // Handle both IPFS URLs and regular URLs
      const imageUrl = metadata.image.startsWith('ipfs://')
        ? `https://gateway.pinata.cloud/ipfs/${metadata.image.replace('ipfs://', '')}`
        : metadata.image;
      setPreviewUrl(imageUrl);
    } else if (metadata?.animation_url) {
      const animUrl = metadata.animation_url.startsWith('ipfs://')
        ? `https://gateway.pinata.cloud/ipfs/${metadata.animation_url.replace('ipfs://', '')}`
        : metadata.animation_url;
      setPreviewUrl(animUrl);
    }
  }, [metadata]);

  const renderPreview = () => {
    if (!previewUrl) {
      return (
        <div className="bg-gray-900 rounded-lg p-12 text-center">
          <p className="text-gray-400 mb-4">No preview available</p>
          <p className="text-sm text-gray-500">View the metadata file directly via IPFS links below</p>
        </div>
      );
    }

    switch (mediaType.toLowerCase()) {
      case 'audio':
      case 'sfx':
        return (
          <div className="bg-gray-900 rounded-lg p-8">
            <div className="text-center mb-4">
              <span className="text-6xl">🎵</span>
            </div>
            <audio controls className="w-full">
              <source src={previewUrl} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );

      case 'visual':
      case 'vfx':
        // Try to determine if it's an image or video
        const isVideo = previewUrl.match(/\.(mp4|webm|ogg|mov)$/i);
        
        if (isVideo) {
          return (
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <video controls className="w-full">
                <source src={previewUrl} />
                Your browser does not support the video element.
              </video>
            </div>
          );
        } else {
          return (
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Asset preview"
                className="w-full h-auto"
                onError={(e) => {
                  // If image fails to load, try as video
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          );
        }

      default:
        return (
          <div className="bg-gray-900 rounded-lg p-8">
            <iframe 
              src={previewUrl}
              className="w-full h-96 rounded"
              title="Asset preview"
            />
          </div>
        );
    }
  };

  return renderPreview();
}

function InfoRow({ label, value, isAddress, highlight }: { 
  label: string; 
  value: string; 
  isAddress?: boolean;
  highlight?: 'green' | 'blue' | 'yellow' | 'purple';
}) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const getHighlightColor = () => {
    switch (highlight) {
      case 'green': return 'text-green-400';
      case 'blue': return 'text-blue-400';
      case 'yellow': return 'text-yellow-400';
      case 'purple': return 'text-purple-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-700">
      <span className="text-gray-400">{label}:</span>
      <span className={`font-semibold ${getHighlightColor()}`}>
        {isAddress ? formatAddress(value) : value}
      </span>
    </div>
  );
}
