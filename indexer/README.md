# Envio Indexer for MediaAssetNFT

This directory contains the Envio indexer configuration for indexing MediaAssetNFT smart contract events.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Generate TypeScript types from config:
```bash
pnpm codegen
```

## Development

Start the indexer in development mode (with hot reload):
```bash
pnpm dev
```

This will start the GraphQL endpoint at `http://localhost:8080/v1/graphql`

## Production

Start the indexer in production mode:
```bash
pnpm start
```

## Configuration

- `config.yaml` - Main Envio configuration
- `src/EventHandlers.ts` - Event handler logic
- `.env` - Environment variables (ENVIO_API_TOKEN)

## Indexed Events

- Approval
- ApprovalForAll
- AssetUsed
- BatchMetadataUpdate
- DecryptionKeyReleased
- MediaAssetMinted
- MetadataUpdate
- OwnershipTransferred
- RoyaltyPaid
- Transfer

## GraphQL Queries

Access the GraphQL playground at `http://localhost:8080/v1/graphql` when the indexer is running.

Example query:
```graphql
query {
  MediaAssetMinted(limit: 10) {
    tokenId
    creator
    ipfsHash
    mediaType
  }
}
```
