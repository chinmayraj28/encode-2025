// src/utils/hashFile.js
export async function fileToSHA256Hex(file) {
  // Read as ArrayBuffer
  const buffer = await file.arrayBuffer();
  // Use SubtleCrypto to hash (works in modern browsers)
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  // Convert to hex
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
