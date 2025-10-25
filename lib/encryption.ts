import CryptoJS from 'crypto-js';

/**
 * Generate a random 256-bit encryption key
 */
export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Encrypt a file using AES-256 encryption
 * @param file - The file to encrypt
 * @param key - The encryption key (32-byte hex string)
 * @returns Encrypted file as Blob
 */
export const encryptFile = async (file: File, key: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        // Convert Uint8Array to WordArray for CryptoJS
        const wordArray = CryptoJS.lib.WordArray.create(uint8Array as any);

        // Encrypt using AES
        const encrypted = CryptoJS.AES.encrypt(wordArray, key);
        const encryptedString = encrypted.toString();

        // Convert encrypted string to Blob
        const encryptedBlob = new Blob([encryptedString], {
          type: 'application/octet-stream',
        });

        console.log('✅ File encrypted successfully:', file.name);
        resolve(encryptedBlob);
      } catch (error: any) {
        console.error('❌ Encryption error:', error);
        reject(new Error(`Failed to encrypt file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Decrypt an encrypted file
 * @param encryptedBlob - The encrypted blob from IPFS
 * @param key - The decryption key
 * @param originalMimeType - Original file MIME type (e.g., 'audio/mp3')
 * @returns Decrypted file as Blob
 */
export const decryptFile = async (
  encryptedBlob: Blob,
  key: string,
  originalMimeType: string = 'application/octet-stream'
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const encryptedText = reader.result as string;

        // Decrypt the text
        const decrypted = CryptoJS.AES.decrypt(encryptedText, key);

        // Convert WordArray back to Uint8Array
        const decryptedUint8Array = wordArrayToUint8Array(decrypted);

        // Create blob with original mime type - cast to BlobPart to fix TypeScript error
        const decryptedBlob = new Blob([decryptedUint8Array as BlobPart], { type: originalMimeType });

        console.log('✅ File decrypted successfully');
        resolve(decryptedBlob);
      } catch (error: any) {
        console.error('❌ Decryption error:', error);
        reject(new Error(`Failed to decrypt file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read encrypted file'));
    };

    reader.readAsText(encryptedBlob);
  });
};/**
 * Convert CryptoJS WordArray to Uint8Array
 */
function wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const u8 = new Uint8Array(sigBytes);
  
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  
  return u8;
}

/**
 * Download a decrypted file
 * @param blob - The decrypted blob
 * @param filename - Desired filename
 */
export function downloadDecryptedFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Create a preview/watermarked version of an audio file
 * Note: This is a placeholder - real implementation would use Web Audio API
 */
export async function createWatermarkedPreview(file: File): Promise<File> {
  // For now, return the original file
  // TODO: Implement actual watermarking using Web Audio API
  // - Reduce quality to 128kbps
  // - Add audio watermark every 10 seconds
  // - Limit to 30-second preview
  return file;
}
