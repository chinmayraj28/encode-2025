'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { uploadFileToPinata, uploadJSONToPinata, getPinataUrl } from '@/lib/pinata';
import { generateEncryptionKey, encryptFile } from '@/lib/encryption';
import { generatePreview } from '@/lib/preview-generator';
import { parseEther, encodeFunctionData } from 'viem';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// Contract ABI (updated for encryption support)
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "string", "name": "previewHash", "type": "string" },
      { "internalType": "string", "name": "mediaType", "type": "string" },
      { "internalType": "string", "name": "tokenURI", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "string", "name": "encryptionKey", "type": "string" },
      {
        "components": [
          { "internalType": "address", "name": "wallet", "type": "address" },
          { "internalType": "uint256", "name": "sharePercentage", "type": "uint256" }
        ],
        "internalType": "struct MediaAssetNFT.Collaborator[]",
        "name": "_collaborators",
        "type": "tuple[]"
      }
    ],
    "name": "mintMediaAsset",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

interface Collaborator {
  wallet: string;
  sharePercentage: number;
}

export default function UploadForm({ onMintSuccess }: { onMintSuccess?: () => void }) {
  const { address, isConnected, chain } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<string>('audio');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('0.01');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const { data: hash, sendTransaction, isPending, error: writeError } = useSendTransaction();
  
  const { isLoading: isConfirming, isSuccess, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addCollaborator = () => {
    setCollaborators([...collaborators, { wallet: '', sharePercentage: 0 }]);
  };

  const removeCollaborator = (index: number) => {
    setCollaborators(collaborators.filter((_, i) => i !== index));
  };

  const updateCollaborator = (index: number, field: 'wallet' | 'sharePercentage', value: string | number) => {
    const updated = [...collaborators];
    updated[index] = { ...updated[index], [field]: value };
    setCollaborators(updated);
  };

  const uploadToIPFS = async (file: File, metadata: any): Promise<{ metadataCID: string; fileCID: string; previewCID: string; encryptionKey: string }> => {
    // Generate encryption key
    const encryptionKey = generateEncryptionKey();
    
    // Encrypt the file
    setUploadStatus('🔒 Encrypting file...');
    const encryptedBlob = await encryptFile(file, encryptionKey);
    const encryptedFile = new File([encryptedBlob], `${file.name}.encrypted`, { type: 'application/octet-stream' });
    
    // Upload encrypted file to Pinata
    setUploadStatus('📤 Uploading encrypted file to IPFS...');
    const fileUpload = await uploadFileToPinata(encryptedFile);
    const fileCID = fileUpload.cid;
    
    // Generate preview (watermarked/degraded version)
    setUploadStatus('🎬 Generating preview...');
    const previewFile = await generatePreview(file, metadata.mediaType);
    
    // Upload preview to IPFS (unencrypted, for public browsing)
    setUploadStatus('📤 Uploading preview to IPFS...');
    const previewUpload = await uploadFileToPinata(previewFile);
    const previewCID = previewUpload.cid;
    
    // Create metadata with file references
    const metadataWithFile = {
      ...metadata,
      file: `ipfs://${fileCID}`,              // Encrypted full file
      fileUrl: getPinataUrl(fileCID),
      preview: `ipfs://${previewCID}`,       // Preview (unencrypted for demo)
      previewUrl: getPinataUrl(previewCID),
      encrypted: true,
      mimeType: file.type,
    };
    
    // Upload metadata JSON to Pinata
    setUploadStatus('📤 Uploading metadata to IPFS...');
    const metadataUpload = await uploadJSONToPinata(metadataWithFile);
    const metadataCID = metadataUpload.cid;

    return { metadataCID, fileCID, previewCID, encryptionKey };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !isConnected || !CONTRACT_ADDRESS) {
      setUploadStatus('❌ Please connect wallet and select a file');
      return;
    }

    if (!title) {
      setUploadStatus('❌ Please enter a title');
      return;
    }

    // Validate collaborators if any
    if (collaborators.length > 0) {
      const totalCollabShare = collaborators.reduce((sum, c) => sum + c.sharePercentage, 0);
      
      // Check if total exceeds 100%
      if (totalCollabShare > 100) {
        setUploadStatus('❌ Collaborator shares cannot exceed 100%');
        return;
      }
      
      // Validate wallet addresses
      for (const collab of collaborators) {
        if (!collab.wallet || collab.wallet.length !== 42 || !collab.wallet.startsWith('0x')) {
          setUploadStatus('❌ Invalid collaborator wallet address');
          return;
        }
      }
    }

    try {
      setIsUploading(true);
      setUploadStatus('📤 Preparing upload...');

      // Calculate shares - if collaborators don't add to 100%, creator gets the rest
      const totalCollabShare = collaborators.reduce((sum, c) => sum + c.sharePercentage, 0);
      const creatorShare = 100 - totalCollabShare;
      
      // Build final collaborator list including creator if there are collaborators
      let contractCollaborators: { wallet: `0x${string}`; sharePercentage: bigint }[] = [];
      
      if (collaborators.length > 0) {
        // Add creator first with their share
        if (creatorShare > 0) {
          contractCollaborators.push({
            wallet: address as `0x${string}`,
            sharePercentage: BigInt(creatorShare * 100), // Convert to basis points
          });
        }
        
        // Add other collaborators
        contractCollaborators = [
          ...contractCollaborators,
          ...collaborators.map(c => ({
            wallet: c.wallet as `0x${string}`,
            sharePercentage: BigInt(c.sharePercentage * 100),
          }))
        ];
      }
      // If no collaborators, leave array empty (creator gets 100% automatically)
      
      // Prepare metadata
      const metadata = {
        name: title,
        description: description,
        mediaType: mediaType,
        creator: address,
        timestamp: new Date().toISOString(),
        collaborators: collaborators,
      };

      // Upload to IPFS with encryption
      const { metadataCID, fileCID, previewCID, encryptionKey } = await uploadToIPFS(file, metadata);
      const tokenURI = `ipfs://${metadataCID}`;

      setUploadStatus('✅ Uploaded to IPFS! Now minting NFT...');

      // Mint NFT on blockchain with encryption key
      console.log('📝 Minting with params:', {
        fileCID,
        previewCID,
        mediaType,
        tokenURI,
        price: parseEther(price),
        encryptionKey: encryptionKey.substring(0, 10) + '...',
        creatorShare: creatorShare + '%',
        collaborators: contractCollaborators,
      });

      // Encode the contract call data
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'mintMediaAsset',
        args: [
          fileCID,                              // ipfsHash: Encrypted file hash
          previewCID,                           // previewHash: Preview file hash (unencrypted)
          mediaType,                            // mediaType
          tokenURI,                             // tokenURI
          parseEther(price),                    // price: Price in wei
          encryptionKey,                        // encryptionKey: Store encryption key in contract
          contractCollaborators,                // collaborators
        ],
      });

      // Send transaction using useSendTransaction for Openfort compatibility
      sendTransaction({
        to: CONTRACT_ADDRESS,
        data,
      });

      setUploadStatus('⏳ Waiting for transaction confirmation...');
      
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        cause: error.cause,
        stack: error.stack,
      });
      setUploadStatus(`❌ Error: ${error.message || 'Unknown error'}`);
      setIsUploading(false);
    }
  };

  // Handle transaction errors
  useEffect(() => {
    if (writeError) {
      console.error('❌ Write contract error:', writeError);
      setUploadStatus(`❌ Transaction failed: ${writeError.message}`);
      setIsUploading(false);
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      console.error('❌ Confirmation error:', confirmError);
      setUploadStatus(`❌ Transaction confirmation failed: ${confirmError.message}`);
      setIsUploading(false);
    }
  }, [confirmError]);

  // Handle successful minting
  useEffect(() => {
    if (isSuccess && isUploading) {
      setUploadStatus('🎉 Successfully minted! Your asset is now on the blockchain.');
      setIsUploading(false);
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setPrice('0.01');
      setCollaborators([]);
      
      // Notify parent
      if (onMintSuccess) {
        onMintSuccess();
      }
    }
  }, [isSuccess, isUploading, onMintSuccess]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Your Media Asset</h2>
      
      {!isConnected ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-2">👆 Connect your wallet to get started</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="My Awesome Beat"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="A lofi hip-hop beat with jazzy piano..."
              rows={3}
            />
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Media Type *</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="audio">🎵 Audio</option>
              <option value="visual">🎨 Visual</option>
              <option value="vfx">✨ VFX</option>
              <option value="sfx">🔊 SFX</option>
              <option value="3d">🧊 3D Model</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">File *</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              accept={mediaType === '3d' ? '.glb,.gltf,.fbx,.obj,.stl,.blend' : 'audio/*,video/*,image/*'}
              required
            />
            {file && <p className="text-sm text-gray-400 mt-2">Selected: {file.name}</p>}
            {mediaType === '3d' && (
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: GLB, GLTF, FBX, OBJ, STL, Blender
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Price (ETH) *</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="0.01"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              How much buyers pay to access your full asset
            </p>
          </div>

          {/* Note: Royalty field hidden - payment goes 100% to creator/collaborators */}
          {/* If you have collaborators, the payment is split based on their share percentages */}

          {/* Collaborators */}
          <div>
            <label className="block text-sm font-medium mb-2">Collaborators (Optional)</label>
            <p className="text-xs text-gray-400 mb-3">
              Add collaborators to split revenue. Any remaining percentage automatically goes to you (the creator).
            </p>
            {collaborators.map((collab, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="0x... wallet address"
                  value={collab.wallet}
                  onChange={(e) => updateCollaborator(index, 'wallet', e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <input
                  type="number"
                  placeholder="% share"
                  value={collab.sharePercentage || ''}
                  onChange={(e) => updateCollaborator(index, 'sharePercentage', parseFloat(e.target.value))}
                  className="w-24 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  min="0"
                  max="100"
                />
                <button
                  type="button"
                  onClick={() => removeCollaborator(index)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  ❌
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCollaborator}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              + Add Collaborator
            </button>
            {collaborators.length > 0 && (
              <div className="mt-3 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Collaborators total:</span>
                  <span className={`font-semibold ${
                    collaborators.reduce((sum, c) => sum + c.sharePercentage, 0) > 100 
                      ? 'text-red-400' 
                      : 'text-blue-400'
                  }`}>
                    {collaborators.reduce((sum, c) => sum + c.sharePercentage, 0)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Your share (automatic):</span>
                  <span className={`font-semibold ${
                    100 - collaborators.reduce((sum, c) => sum + c.sharePercentage, 0) < 0
                      ? 'text-red-400'
                      : 'text-green-400'
                  }`}>
                    {Math.max(0, 100 - collaborators.reduce((sum, c) => sum + c.sharePercentage, 0))}%
                  </span>
                </div>
                {collaborators.reduce((sum, c) => sum + c.sharePercentage, 0) > 100 && (
                  <p className="text-xs text-red-400 mt-2">
                    ⚠️ Total cannot exceed 100%
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || isPending || isConfirming}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 py-3 rounded-lg font-semibold transition-all"
          >
            {isUploading || isPending || isConfirming ? '⏳ Processing...' : '🚀 Upload & Mint NFT'}
          </button>

          {/* Status Message */}
          {uploadStatus && (
            <div className={`p-4 rounded-lg ${uploadStatus.includes('❌') ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
              <p className="text-sm">{uploadStatus}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
