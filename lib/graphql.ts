/**
 * GraphQL client for querying Envio indexed data
 */

import { createPublicClient, http, fallback } from 'viem';
import { sepolia } from 'viem/chains';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/v1/graphql';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// RPC client for calling tokenURI
const RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_ALCHEMY_RPC || 'https://ethereum-sepolia-rpc.publicnode.com',
  'https://rpc.sepolia.org',
  'https://eth-sepolia.public.blastapi.io',
];

const viemClient = createPublicClient({
  chain: sepolia,
  transport: fallback(
    RPC_ENDPOINTS.map(url => http(url, {
      timeout: 10_000,
      retryCount: 2,
      retryDelay: 1000,
    }))
  ),
});

const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getMediaAsset",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "string", "name": "previewHash", "type": "string" },
          { "internalType": "string", "name": "mediaType", "type": "string" },
          { "internalType": "uint256", "name": "uploadTimestamp", "type": "uint256" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "usageCount", "type": "uint256" },
          { "internalType": "uint256", "name": "totalRevenue", "type": "uint256" }
        ],
        "internalType": "struct MediaAssetNFT.MediaAsset",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Execute a GraphQL query against the Envio indexer
 */
export async function queryGraphQL<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data as T;
}

/**
 * Query all minted media assets with full metadata
 */
export async function getMediaAssetsMinted(limit?: number) {
  const query = `
    query GetMintedAssets($limit: Int) {
      MediaAssetNFT_MediaAssetMinted(
        ${limit ? 'limit: $limit' : ''}
        order_by: { id: desc }
      ) {
        id
        tokenId
        creator
        ipfsHash
        mediaType
      }
    }
  `;

  const result = await queryGraphQL<{
    MediaAssetNFT_MediaAssetMinted: Array<{
      id: string;
      tokenId: string;
      creator: string;
      ipfsHash: string;
      mediaType: string;
    }>;
  }>(query, limit ? { limit } : {});

  // Fetch metadata and preview hash from contract
  const assetsWithMetadata = await Promise.all(
    result.MediaAssetNFT_MediaAssetMinted.map(async (asset) => {
      try {
        // Call contract to get full asset data including previewHash
        const [tokenURI, assetData] = await Promise.all([
          viemClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'tokenURI',
            args: [BigInt(asset.tokenId)],
          } as any),
          viemClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getMediaAsset',
            args: [BigInt(asset.tokenId)],
          } as any) as Promise<any>
        ]);

        // Extract CID from ipfs:// URI
        const metadataCID = String(tokenURI).replace('ipfs://', '');
        
        // Try multiple IPFS gateways (server-side, so use absolute URLs only)
        const urls = [
          `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud'}/ipfs/${metadataCID}`,
          `https://ipfs.io/ipfs/${metadataCID}`,
          `https://cloudflare-ipfs.com/ipfs/${metadataCID}`,
        ];

        let metadata = null;
        for (const url of urls) {
          try {
            const metadataResponse = await fetch(url, {
              headers: process.env.NEXT_PUBLIC_PINATA_JWT ? {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
              } : {}
            });
            if (metadataResponse.ok) {
              metadata = await metadataResponse.json();
              break; // Success, exit loop
            }
          } catch (err) {
            console.warn(`⚠️ Failed to load metadata from ${url}`);
            continue; // Try next URL
          }
        }
        
        return {
          ...asset,
          previewHash: assetData.previewHash, // Add previewHash from contract
          price: assetData.price.toString(), // Convert BigInt to string for JSON serialization
          metadata,
        };
      } catch (error) {
        console.error(`Failed to fetch metadata for token ${asset.tokenId}:`, error);
        return {
          ...asset,
          previewHash: '', // Empty if failed
          price: '0',
          metadata: null,
        };
      }
    })
  );

  return {
    MediaAssetNFT_MediaAssetMinted: assetsWithMetadata,
  };
}

/**
 * Query assets by creator address with full metadata
 */
export async function getAssetsByCreator(creator: string, limit?: number) {
  const query = `
    query GetAssetsByCreator($creator: String!, $limit: Int) {
      MediaAssetNFT_MediaAssetMinted(
        where: { creator: { _eq: $creator } }
        order_by: { id: desc }
        ${limit ? 'limit: $limit' : ''}
      ) {
        id
        tokenId
        creator
        ipfsHash
        mediaType
      }
    }
  `;

  const result = await queryGraphQL<{
    MediaAssetNFT_MediaAssetMinted: Array<{
      id: string;
      tokenId: string;
      creator: string;
      ipfsHash: string;
      mediaType: string;
    }>;
  }>(query, limit ? { creator, limit } : { creator });

  // Fetch metadata and preview hash from contract
  const assetsWithMetadata = await Promise.all(
    result.MediaAssetNFT_MediaAssetMinted.map(async (asset) => {
      try {
        // Call contract to get full asset data including previewHash
        const [tokenURI, assetData] = await Promise.all([
          viemClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'tokenURI',
            args: [BigInt(asset.tokenId)],
          } as any),
          viemClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getMediaAsset',
            args: [BigInt(asset.tokenId)],
          } as any) as Promise<any>
        ]);

        // Extract CID from ipfs:// URI
        const metadataCID = String(tokenURI).replace('ipfs://', '');
        
        // Try multiple IPFS gateways (server-side, so use absolute URLs only)
        const urls = [
          `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud'}/ipfs/${metadataCID}`,
          `https://ipfs.io/ipfs/${metadataCID}`,
          `https://cloudflare-ipfs.com/ipfs/${metadataCID}`,
        ];

        let metadata = null;
        for (const url of urls) {
          try {
            const metadataResponse = await fetch(url, {
              headers: process.env.NEXT_PUBLIC_PINATA_JWT ? {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
              } : {}
            });
            if (metadataResponse.ok) {
              metadata = await metadataResponse.json();
              break; // Success, exit loop
            }
          } catch (err) {
            console.warn(`⚠️ Failed to load metadata from ${url}`);
            continue; // Try next URL
          }
        }
        
        return {
          ...asset,
          previewHash: assetData.previewHash, // Add previewHash from contract
          price: assetData.price.toString(), // Convert BigInt to string for JSON serialization
          metadata,
        };
      } catch (error) {
        console.error(`Failed to fetch metadata for token ${asset.tokenId}:`, error);
        return {
          ...asset,
          previewHash: '', // Empty if failed
          price: '0',
          metadata: null,
        };
      }
    })
  );

  return {
    MediaAssetNFT_MediaAssetMinted: assetsWithMetadata,
  };
}

/**
 * Query transfer history for a token
 */
export async function getTokenTransfers(tokenId: string) {
  const query = `
    query GetTokenTransfers($tokenId: String!) {
      MediaAssetNFT_Transfer(
        where: { tokenId: { _eq: $tokenId } }
        order_by: { id: desc }
      ) {
        id
        from
        to
        tokenId
      }
    }
  `;

  return queryGraphQL<{
    MediaAssetNFT_Transfer: Array<{
      id: string;
      from: string;
      to: string;
      tokenId: string;
    }>;
  }>(query, { tokenId });
}

/**
 * Query asset usage history
 */
export async function getAssetUsage(tokenId: string) {
  const query = `
    query GetAssetUsage($tokenId: String!) {
      MediaAssetNFT_AssetUsed(
        where: { tokenId: { _eq: $tokenId } }
        order_by: { id: desc }
      ) {
        id
        tokenId
        user
        paymentAmount
      }
    }
  `;

  return queryGraphQL<{
    MediaAssetNFT_AssetUsed: Array<{
      id: string;
      tokenId: string;
      user: string;
      paymentAmount: string;
    }>;
  }>(query, { tokenId });
}

/**
 * Query decryption key releases
 */
export async function getDecryptionKeyReleases(tokenId: string) {
  const query = `
    query GetDecryptionKeys($tokenId: String!) {
      MediaAssetNFT_DecryptionKeyReleased(
        where: { tokenId: { _eq: $tokenId } }
        order_by: { id: desc }
      ) {
        id
        tokenId
        buyer
        decryptionKey
      }
    }
  `;

  return queryGraphQL<{
    MediaAssetNFT_DecryptionKeyReleased: Array<{
      id: string;
      tokenId: string;
      buyer: string;
      decryptionKey: string;
    }>;
  }>(query, { tokenId });
}

/**
 * Query royalty payments for a token
 */
export async function getRoyaltyPayments(tokenId: string) {
  const query = `
    query GetRoyaltyPayments($tokenId: String!) {
      MediaAssetNFT_RoyaltyPaid(
        where: { tokenId: { _eq: $tokenId } }
        order_by: { id: desc }
      ) {
        id
        tokenId
        recipient
        amount
      }
    }
  `;

  return queryGraphQL<{
    MediaAssetNFT_RoyaltyPaid: Array<{
      id: string;
      tokenId: string;
      recipient: string;
      amount: string;
    }>;
  }>(query, { tokenId });
}

/**
 * Get all events for a specific token ID
 */
export async function getTokenHistory(tokenId: string) {
  const [transfers, usage, decryptionKeys, royalties] = await Promise.all([
    getTokenTransfers(tokenId),
    getAssetUsage(tokenId),
    getDecryptionKeyReleases(tokenId),
    getRoyaltyPayments(tokenId),
  ]);

  return {
    transfers: transfers.MediaAssetNFT_Transfer,
    usage: usage.MediaAssetNFT_AssetUsed,
    decryptionKeys: decryptionKeys.MediaAssetNFT_DecryptionKeyReleased,
    royalties: royalties.MediaAssetNFT_RoyaltyPaid,
  };
}
