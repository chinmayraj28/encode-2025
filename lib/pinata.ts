import { PinataSDK } from 'pinata-web3';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';

export const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY,
});

export const uploadFileToPinata = async (file: File) => {
  try {
    const upload = await pinata.upload.file(file);
    return upload;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw error;
  }
};

export const uploadJSONToPinata = async (json: any) => {
  try {
    const upload = await pinata.upload.json(json);
    return upload;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw error;
  }
};

export const getPinataUrl = (ipfsHash: string) => {
  return `https://${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
};
