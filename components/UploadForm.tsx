'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { uploadFileToPinata, uploadJSONToPinata, getPinataUrl } from '@/lib/pinata';
import { generateEncryptionKey, encryptFile } from '@/lib/encryption';
import { generatePreview } from '@/lib/preview-generator';
import { validateFile, getAcceptedFileTypes, getSupportedFormatsDescription } from '@/lib/file-validation';
import { parseEther, encodeFunctionData } from 'viem';
import toast from 'react-hot-toast';

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
  const [fileValidationError, setFileValidationError] = useState<string>('');

  const { data: hash, sendTransaction, isPending, error: writeError } = useSendTransaction();
  
  const { isLoading: isConfirming, isSuccess, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });

  // Show success toast when minting is complete
  useEffect(() => {
    if (isSuccess) {
      toast.success('🎉 Asset minted successfully! Your NFT is now on the blockchain.', {
        duration: 5000,
        icon: '✅',
      });
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setPrice('0.01');
      setCollaborators([]);
      setUploadStatus('');
      setIsUploading(false);
      
      // Call success callback if provided
      if (onMintSuccess) {
        onMintSuccess();
      }
    }
  }, [isSuccess, onMintSuccess]);

  // Show error toast if transaction fails
  useEffect(() => {
    if (writeError || confirmError) {
      const errorMessage = writeError?.message || confirmError?.message || 'Transaction failed';
      toast.error(`❌ ${errorMessage}`, {
        duration: 5000,
      });
    }
  }, [writeError, confirmError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type matches media type
      const validation = validateFile(selectedFile, mediaType, 500); // 500MB max
      
      if (!validation.isValid) {
        setFileValidationError(validation.error || 'Invalid file');
        setFile(null);
        toast.error(validation.error || 'Invalid file type', {
          duration: 5000,
        });
        // Reset the input
        e.target.value = '';
        return;
      }
      
      // File is valid
      setFileValidationError('');
      setFile(selectedFile);
      toast.success(`✓ ${selectedFile.name} validated successfully`, {
        duration: 3000,
      });
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

  // Re-validate file when media type changes
  const handleMediaTypeChange = (newMediaType: string) => {
    setMediaType(newMediaType);
    
    // If a file is already selected, revalidate it
    if (file) {
      const validation = validateFile(file, newMediaType, 500);
      
      if (!validation.isValid) {
        setFileValidationError(validation.error || 'Invalid file for this media type');
        setFile(null);
        toast.error(`File removed: ${validation.error}`, {
          duration: 5000,
        });
      } else {
        setFileValidationError('');
        toast.success(`✓ File is compatible with ${newMediaType}`, {
          duration: 3000,
        });
      }
    }
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
    const fileCID = fileUpload.IpfsHash;
    
    // Generate preview (watermarked/degraded version)
    setUploadStatus('🎬 Generating preview...');
    const previewFile = await generatePreview(file, metadata.mediaType);
    
    // Upload preview to IPFS (unencrypted, for public browsing)
    setUploadStatus('📤 Uploading preview to IPFS...');
    const previewUpload = await uploadFileToPinata(previewFile);
    const previewCID = previewUpload.IpfsHash;
    
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
    const metadataCID = metadataUpload.IpfsHash;

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
    <div className="max-w-3xl mx-auto">
      {!isConnected ? (
        <div className="text-center py-16 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl">
          <div className="text-6xl mb-6">🔐</div>
          <h3 className="text-2xl font-bold mb-3 text-white">Connect Your Wallet</h3>
          <p className="text-gray-400 mb-6">Please connect your wallet to start uploading assets</p>
          <div className="inline-block px-6 py-3 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-300">
            Click "Connect Wallet" in the top right corner
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-200">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-white placeholder-gray-500"
              placeholder="e.g., Lofi Hip Hop Beat"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-200">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-3 bg-gray-900/50 border border-gray-700/30 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-white placeholder-gray-500 resize-none"
              placeholder="Describe your asset, its style, use cases, etc."
              rows={4}
            />
          </div>

          {/* Media Type and Price - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Media Type */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-200">
                Media Type <span className="text-red-400">*</span>
              </label>
              <select
                value={mediaType}
                onChange={(e) => handleMediaTypeChange(e.target.value)}
                className="w-full px-5 py-3 bg-gray-900/50 border border-gray-700/30 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-white appearance-none cursor-pointer"
              >
                <option value="audio">🎵 Audio</option>
                <option value="visual">🎨 Visual</option>
                <option value="vfx">✨ VFX</option>
                <option value="sfx">🔊 SFX</option>
                <option value="3d">🧊 3D Model</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-200">
                Price (ETH) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-5 py-3 bg-gray-900/50 border border-gray-700/30 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-white placeholder-gray-500"
                placeholder="0.01"
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                💰 You receive 100% of this amount
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-200">
              File <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-5 py-3 bg-gray-900/50 border border-gray-700/30 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-white file:mr-4 file:py-2 file:px-6 file:rounded-lg file:border-0 file:bg-white file:text-gray-900 file:font-semibold hover:file:bg-gray-100 file:cursor-pointer file:transition-all file:shadow-md hover:file:shadow-lg"
                accept={getAcceptedFileTypes(mediaType)}
                required
              />
            </div>
            {file && !fileValidationError && (
              <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-300 flex items-center gap-2">
                  <span>✓</span> Selected: <span className="font-semibold">{file.name}</span>
                  <span className="text-green-400/70">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </p>
              </div>
            )}
            {fileValidationError && (
              <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-300 flex items-center gap-2">
                  <span>❌</span> {fileValidationError}
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {getSupportedFormatsDescription(mediaType)} • Max 500MB
            </p>
          </div>

          {/* Collaborators */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-200">
              Collaborators (Optional)
            </label>
            <div className="bg-gray-900/30 border border-gray-700/30 rounded-xl p-5 mb-3">
              <p className="text-xs text-gray-400 mb-4">
                Add collaborators to split revenue. Any remaining percentage automatically goes to you (the creator).
              </p>
              {collaborators.map((collab, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="0x... wallet address"
                    value={collab.wallet}
                    onChange={(e) => updateCollaborator(index, 'wallet', e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-900/50 border border-gray-700/30 rounded-lg focus:outline-none focus:border-teal-500 transition-all text-white placeholder-gray-500 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="% share"
                    value={collab.sharePercentage || ''}
                    onChange={(e) => updateCollaborator(index, 'sharePercentage', parseFloat(e.target.value))}
                    className="w-28 px-4 py-2.5 bg-gray-900/50 border border-gray-700/30 rounded-lg focus:outline-none focus:border-teal-500 transition-all text-white placeholder-gray-500 text-sm"
                    min="0"
                    max="100"
                  />
                  <button
                    type="button"
                    onClick={() => removeCollaborator(index)}
                    className="px-4 py-2.5 bg-red-600/10 border border-red-500/30 hover:bg-red-600/20 rounded-lg transition-all"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCollaborator}
                className="text-sm text-teal-400 hover:text-teal-300 font-medium flex items-center gap-2 mt-2"
              >
                <span className="text-lg">+</span> Add Collaborator
              </button>
            </div>
            {collaborators.length > 0 && (
              <div className="bg-teal-900/10 border border-teal-500/20 rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-300">Collaborators total:</span>
                  <span className={`text-lg font-bold ${
                    collaborators.reduce((sum, c) => sum + c.sharePercentage, 0) > 100 
                      ? 'text-red-400' 
                      : 'text-blue-400'
                  }`}>
                    {collaborators.reduce((sum, c) => sum + c.sharePercentage, 0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Your share (automatic):</span>
                  <span className={`text-lg font-bold ${
                    100 - collaborators.reduce((sum, c) => sum + c.sharePercentage, 0) < 0
                      ? 'text-red-400'
                      : 'text-green-400'
                  }`}>
                    {Math.max(0, 100 - collaborators.reduce((sum, c) => sum + c.sharePercentage, 0))}%
                  </span>
                </div>
                {collaborators.reduce((sum, c) => sum + c.sharePercentage, 0) > 100 && (
                  <p className="text-xs text-red-400 mt-3 flex items-center gap-2">
                    <span>⚠️</span> Total cannot exceed 100%
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || isPending || isConfirming}
            className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-900 disabled:text-gray-400 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isUploading || isPending || isConfirming ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              '🚀 Upload & Mint NFT'
            )}
          </button>

          {/* Status Message */}
          {uploadStatus && (
            <div className={`rounded-xl p-5 backdrop-blur-sm ${
              uploadStatus.includes('❌') 
                ? 'bg-red-900/20 border border-red-500/30' 
                : uploadStatus.includes('🎉')
                ? 'bg-green-900/20 border border-green-500/30'
                : 'bg-blue-900/20 border border-blue-500/30'
            }`}>
              <p className="text-sm font-medium text-gray-200">{uploadStatus}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
