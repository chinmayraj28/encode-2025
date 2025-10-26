/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  MediaAssetNFT,
  MediaAssetNFT_Approval,
  MediaAssetNFT_ApprovalForAll,
  MediaAssetNFT_AssetUsed,
  MediaAssetNFT_BatchMetadataUpdate,
  MediaAssetNFT_DecryptionKeyReleased,
  MediaAssetNFT_MediaAssetMinted,
  MediaAssetNFT_MetadataUpdate,
  MediaAssetNFT_OwnershipTransferred,
  MediaAssetNFT_RoyaltyPaid,
  MediaAssetNFT_Transfer,
} from "generated";

MediaAssetNFT.Approval.handler(async ({ event, context }) => {
  const entity: MediaAssetNFT_Approval = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    approved: event.params.approved,
    tokenId: event.params.tokenId,
  };

  context.MediaAssetNFT_Approval.set(entity);
});

MediaAssetNFT.ApprovalForAll.handler(async ({ event, context }) => {
  const entity: MediaAssetNFT_ApprovalForAll = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    operator: event.params.operator,
    approved: event.params.approved,
  };

  context.MediaAssetNFT_ApprovalForAll.set(entity);
});

MediaAssetNFT.AssetUsed.handler(async ({ event, context }) => {
  const entity: MediaAssetNFT_AssetUsed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    tokenId: event.params.tokenId,
    user: event.params.user,
    paymentAmount: event.params.paymentAmount,
  };

  context.MediaAssetNFT_AssetUsed.set(entity);
});

MediaAssetNFT.BatchMetadataUpdate.handler(async ({ event, context }) => {
  const entity: MediaAssetNFT_BatchMetadataUpdate = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    _fromTokenId: event.params._fromTokenId,
    _toTokenId: event.params._toTokenId,
  };

  context.MediaAssetNFT_BatchMetadataUpdate.set(entity);
});

MediaAssetNFT.DecryptionKeyReleased.handler(async ({ event, context }) => {
  const entity: MediaAssetNFT_DecryptionKeyReleased = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    tokenId: event.params.tokenId,
    buyer: event.params.buyer,
    decryptionKey: event.params.decryptionKey,
  };

  context.MediaAssetNFT_DecryptionKeyReleased.set(entity);
});

MediaAssetNFT.MediaAssetMinted.handler(async ({ event, context }) => {
  const entity: MediaAssetNFT_MediaAssetMinted = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    tokenId: event.params.tokenId,
    creator: event.params.creator,
    ipfsHash: event.params.ipfsHash,
    mediaType: event.params.mediaType,
  };

  context.MediaAssetNFT_MediaAssetMinted.set(entity);
});

MediaAssetNFT.MetadataUpdate.handler(async ({ event, context }) => {
  const entity: MediaAssetNFT_MetadataUpdate = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    _tokenId: event.params._tokenId,
  };

  context.MediaAssetNFT_MetadataUpdate.set(entity);
});

MediaAssetNFT.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: MediaAssetNFT_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
  };

  context.MediaAssetNFT_OwnershipTransferred.set(entity);
});

MediaAssetNFT.RoyaltyPaid.handler(async ({ event, context }) => {
  const entity: MediaAssetNFT_RoyaltyPaid = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    tokenId: event.params.tokenId,
    recipient: event.params.recipient,
    amount: event.params.amount,
  };

  context.MediaAssetNFT_RoyaltyPaid.set(entity);
});

MediaAssetNFT.Transfer.handler(async ({ event, context }) => {
  const entity: MediaAssetNFT_Transfer = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    from: event.params.from,
    to: event.params.to,
    tokenId: event.params.tokenId,
  };

  context.MediaAssetNFT_Transfer.set(entity);
});
