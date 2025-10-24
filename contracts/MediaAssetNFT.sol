// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MediaAssetNFT
 * @dev NFT contract for media assets (audio, visual, VFX/SFX) with royalty tracking
 */
contract MediaAssetNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Struct to store media asset metadata
    struct MediaAsset {
        string ipfsHash;        // IPFS hash of the ENCRYPTED media file
        string previewHash;     // IPFS hash of the preview/watermarked version (unencrypted)
        string mediaType;       // "audio", "visual", "vfx", "sfx"
        uint256 uploadTimestamp;
        address creator;
        uint256 royaltyPercentage; // Royalty percentage (e.g., 500 = 5%)
        uint256 usageCount;
        uint256 totalRevenue;
    }

    // Struct for collaborative ownership
    struct Collaborator {
        address wallet;
        uint256 sharePercentage; // Percentage in basis points (100 = 1%)
    }

    // Mapping from token ID to media asset details
    mapping(uint256 => MediaAsset) public mediaAssets;
    
    // Mapping from token ID to encryption key (only accessible after purchase)
    mapping(uint256 => string) private decryptionKeys;
    
    // Mapping from token ID to collaborators
    mapping(uint256 => Collaborator[]) public collaborators;
    
    // Mapping to track asset usage
    mapping(uint256 => mapping(address => bool)) public hasUsedAsset;

    // Events
    event MediaAssetMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string ipfsHash,
        string mediaType,
        uint256 royaltyPercentage
    );
    
    event AssetUsed(
        uint256 indexed tokenId,
        address indexed user,
        uint256 paymentAmount
    );
    
    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 amount
    );
    
    event DecryptionKeyReleased(
        uint256 indexed tokenId,
        address indexed buyer,
        string decryptionKey
    );

    constructor() ERC721("MediaAssetNFT", "MEDIA") Ownable(msg.sender) {}

    /**
     * @dev Mint a new media asset NFT with encryption support
     */
    function mintMediaAsset(
        string memory ipfsHash,
        string memory previewHash,
        string memory mediaType,
        string memory tokenURI,
        uint256 royaltyPercentage,
        string memory encryptionKey,
        Collaborator[] memory _collaborators
    ) public returns (uint256) {
        require(royaltyPercentage <= 10000, "Royalty too high"); // Max 100%
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        mediaAssets[tokenId] = MediaAsset({
            ipfsHash: ipfsHash,
            previewHash: previewHash,
            mediaType: mediaType,
            uploadTimestamp: block.timestamp,
            creator: msg.sender,
            royaltyPercentage: royaltyPercentage,
            usageCount: 0,
            totalRevenue: 0
        });
        
        // Store encryption key privately
        decryptionKeys[tokenId] = encryptionKey;

        // Add collaborators if any
        if (_collaborators.length > 0) {
            uint256 totalShare = 0;
            for (uint256 i = 0; i < _collaborators.length; i++) {
                collaborators[tokenId].push(_collaborators[i]);
                totalShare += _collaborators[i].sharePercentage;
            }
            require(totalShare == 10000, "Shares must equal 100%");
        }
        
        emit MediaAssetMinted(tokenId, msg.sender, ipfsHash, mediaType, royaltyPercentage);
        
        return tokenId;
    }

    /**
     * @dev Purchase/use a media asset with automatic royalty distribution
     * Returns the decryption key to the buyer
     */
    function useAsset(uint256 tokenId) public payable returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");
        require(msg.value > 0, "Payment required");
        
        MediaAsset storage asset = mediaAssets[tokenId];
        asset.usageCount++;
        asset.totalRevenue += msg.value;
        
        // Calculate royalty
        uint256 royaltyAmount = (msg.value * asset.royaltyPercentage) / 10000;
        
        // Distribute to collaborators or single creator
        if (collaborators[tokenId].length > 0) {
            _distributeToCollaborators(tokenId, royaltyAmount);
        } else {
            // Send to creator
            (bool success, ) = asset.creator.call{value: royaltyAmount}("");
            require(success, "Royalty payment failed");
            emit RoyaltyPaid(tokenId, asset.creator, royaltyAmount);
        }
        
        hasUsedAsset[tokenId][msg.sender] = true;
        emit AssetUsed(tokenId, msg.sender, msg.value);
        
        // Release decryption key to buyer
        string memory key = decryptionKeys[tokenId];
        emit DecryptionKeyReleased(tokenId, msg.sender, key);
        
        return key;
    }
    
    /**
     * @dev Get decryption key if user has purchased the asset
     */
    function getDecryptionKey(uint256 tokenId) public view returns (string memory) {
        require(hasUsedAsset[tokenId][msg.sender] || ownerOf(tokenId) == msg.sender || mediaAssets[tokenId].creator == msg.sender, 
                "You must purchase this asset first");
        return decryptionKeys[tokenId];
    }

    /**
     * @dev Distribute royalties among collaborators
     */
    function _distributeToCollaborators(uint256 tokenId, uint256 totalAmount) internal {
        Collaborator[] memory collabs = collaborators[tokenId];
        
        for (uint256 i = 0; i < collabs.length; i++) {
            uint256 share = (totalAmount * collabs[i].sharePercentage) / 10000;
            (bool success, ) = collabs[i].wallet.call{value: share}("");
            require(success, "Collaborator payment failed");
            emit RoyaltyPaid(tokenId, collabs[i].wallet, share);
        }
    }

    /**
     * @dev Get media asset details
     */
    function getMediaAsset(uint256 tokenId) public view returns (MediaAsset memory) {
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");
        return mediaAssets[tokenId];
    }

    /**
     * @dev Get collaborators for an asset
     */
    function getCollaborators(uint256 tokenId) public view returns (Collaborator[] memory) {
        return collaborators[tokenId];
    }

    /**
     * @dev Get total number of minted assets
     */
    function getTotalAssets() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
