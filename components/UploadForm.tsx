'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { uploadFileToPinata, uploadJSONToPinata, getPinataUrl } from '@/lib/pinata';
import { generateEncryptionKey, encryptFile } from '@/lib/encryption';
import { parseEther } from 'viem';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// Contract ABI (updated for encryption support)
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "string", "name": "previewHash", "type": "string" },
      { "internalType": "string", "name": "mediaType", "type": "string" },
      { "internalType": "string", "name": "tokenURI", "type": "string" },
      { "internalType": "uint256", "name": "royaltyPercentage", "type": "uint256" },
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
  const { address, isConnected } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<string>('audio');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>(5);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
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

  const uploadToIPFS = async (file: File, metadata: any): Promise<{ metadataCID: string; fileCID: string; encryptionKey: string }> => {
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
    
    // For now, use original file as preview (in production, create watermarked version)
    // TODO: Generate watermarked/low-quality preview
    setUploadStatus('📤 Uploading preview to IPFS...');
    const previewUpload = await uploadFileToPinata(file);
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

    return { metadataCID, fileCID, encryptionKey };
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
      const totalShare = collaborators.reduce((sum, c) => sum + c.sharePercentage, 0);
      if (totalShare !== 100) {
        setUploadStatus('❌ Collaborator shares must add up to 100%');
        return;
      }
      
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

      // Prepare metadata
      const metadata = {
        name: title,
        description: description,
        mediaType: mediaType,
        creator: address,
        timestamp: new Date().toISOString(),
        royaltyPercentage: royaltyPercentage,
        collaborators: collaborators,
      };

      // Upload to IPFS with encryption
      const { metadataCID, fileCID, encryptionKey } = await uploadToIPFS(file, metadata);
      const tokenURI = `ipfs://${metadataCID}`;

      setUploadStatus('✅ Uploaded to IPFS! Now minting NFT...');

      // Convert collaborators to contract format (shares in basis points)
      const contractCollaborators = collaborators.map(c => ({
        wallet: c.wallet as `0x${string}`,
        sharePercentage: BigInt(c.sharePercentage * 100), // Convert to basis points
      }));

      // Mint NFT on blockchain with encryption key
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mintMediaAsset',
        args: [
          fileCID,                              // Encrypted file hash
          metadataCID,                          // Preview hash (using metadata for now)
          mediaType,
          tokenURI,
          BigInt(royaltyPercentage * 100),      // Convert to basis points (5% = 500)
          encryptionKey,                        // Store encryption key in contract
          contractCollaborators,
        ],
      });

      setUploadStatus('⏳ Waiting for transaction confirmation...');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus(`❌ Error: ${error.message}`);
      setIsUploading(false);
    }
  };

  // Handle successful minting
  if (isSuccess && isUploading) {
    setUploadStatus('🎉 Successfully minted! Your asset is now on the blockchain.');
    setIsUploading(false);
    
    // Reset form
    setFile(null);
    setTitle('');
    setDescription('');
    setCollaborators([]);
    
    // Notify parent
    if (onMintSuccess) {
      onMintSuccess();
    }
  }

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
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">File *</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              accept="audio/*,video/*,image/*"
              required
            />
            {file && <p className="text-sm text-gray-400 mt-2">Selected: {file.name}</p>}
          </div>

          {/* Royalty Percentage */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Royalty Percentage: {royaltyPercentage}%
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={royaltyPercentage}
              onChange={(e) => setRoyaltyPercentage(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              How much you earn when others use your asset
            </p>
          </div>

          {/* Collaborators */}
          <div>
            <label className="block text-sm font-medium mb-2">Collaborators (Optional)</label>
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
              <p className="text-xs text-gray-400 mt-2">
                Total share: {collaborators.reduce((sum, c) => sum + c.sharePercentage, 0)}% (must equal 100%)
              </p>
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
