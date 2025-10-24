# 🔒 Preview Security Model

## Overview

Your NFT marketplace uses a **two-tier security system** to protect creators while allowing buyers to evaluate assets before purchase.

---

## 🎯 Two-Tier System

### **Tier 1: Preview Files (Public & Free)**
✅ **Accessible to everyone** without payment

**Purpose**: Allow discovery and evaluation

**Protection Methods**:
- **Images**: Watermarked + reduced resolution (800x600 max, 60% quality)
- **Audio**: First 30 seconds only, low bitrate
- **Video**: First 30 seconds, reduced quality (requires server-side processing)
- **VFX/SFX**: Thumbnails or low-quality samples

### **Tier 2: Full Files (Encrypted & Paid)**
🔒 **Require payment** to access

**Protection**: AES-256 encryption before IPFS upload

**Access Control**: Smart contract only releases decryption key after payment

---

## 🛡️ How It Protects Creators

### **For Images**
```
Original: 4000x3000px, 5MB, PNG
    ↓
Preview: 800x600px, 500KB, JPEG (60% quality) + "PREVIEW" watermark
    ↓
Encrypted: Original file encrypted with AES-256
```

**What users see in preview**:
- ✅ General composition and subject
- ✅ Color palette and style
- ❌ Full resolution for printing/commercial use
- ❌ Unwatermarked version

### **For Audio**
```
Original: 3-minute song, 320kbps MP3, 7MB
    ↓
Preview: First 30 seconds, low-quality WAV
    ↓
Encrypted: Original file encrypted with AES-256
```

**What users hear in preview**:
- ✅ Beginning of the song/sound
- ✅ General vibe and quality
- ❌ Full song/complete audio
- ❌ High-quality version for production

### **For Video**
```
Original: 1080p, 5-minute video, 50MB
    ↓
Preview: First 30 seconds, 480p, reduced bitrate
    ↓
Encrypted: Original file encrypted with AES-256
```

**What users see in preview**:
- ✅ Opening scene/intro
- ✅ Visual style and quality
- ❌ Full video content
- ❌ HD quality for professional use

---

## 🔐 Security Flow

### **Upload Process**
```
1. Creator selects file
2. System generates preview automatically
   - Images: Resize + watermark
   - Audio: Truncate to 30s
   - Video: Truncate + reduce quality
3. System encrypts ORIGINAL file
4. Upload preview to IPFS (public)
5. Upload encrypted file to IPFS
6. Store encryption key in smart contract
```

### **Browse Process**
```
1. User visits gallery
2. Preview files load from IPFS (free)
3. User can view/listen to previews
4. No encryption key needed
5. No payment required
```

### **Purchase Process**
```
1. User likes an asset
2. Clicks "Use Asset" / "Buy"
3. MetaMask prompts payment
4. Payment sent to smart contract
5. Contract releases encryption key
6. User downloads encrypted file
7. Frontend decrypts automatically
8. User gets full-quality original file
```

---

## 📊 Comparison Table

| Feature | Preview File | Full File |
|---------|-------------|-----------|
| **Access** | Public (free) | Paid only |
| **Quality** | Degraded | Full quality |
| **Watermark** | Yes (images) | No |
| **Duration** | 30s max (audio/video) | Complete |
| **Resolution** | Reduced | Original |
| **Encryption** | No | Yes (AES-256) |
| **IPFS Hash** | `previewHash` | `ipfsHash` |
| **Purpose** | Discovery | Usage |

---

## 💡 Why This Works

### **For Creators**:
✅ Assets are protected from theft  
✅ Preview allows legitimate evaluation  
✅ Cannot use preview for commercial purposes  
✅ Full quality only after payment  
✅ Automatic protection (no manual work)

### **For Buyers**:
✅ Can evaluate before purchasing  
✅ No risk of buying wrong asset  
✅ Preview loads instantly (smaller files)  
✅ Get full quality after payment  
✅ Decryption happens automatically

### **For Platform**:
✅ Reduces IPFS bandwidth costs (previews are smaller)  
✅ Improves user experience (faster loading)  
✅ Builds trust (buyers can evaluate)  
✅ Protects revenue (forces payment for full quality)

---

## 🎨 Implementation Details

### **Automatic Preview Generation**

The system uses `lib/preview-generator.ts` to automatically create previews:

```typescript
// Images: Watermark + resize
generateImagePreview(file)
  → Resize to 800x600 max
  → Add "PREVIEW" watermark
  → Reduce quality to 60%
  → Convert to JPEG

// Audio: Truncate
generateAudioPreview(file)
  → Extract first 30 seconds
  → Convert to low-quality WAV
  → Reduce sample rate

// Video: Truncate + reduce (requires server)
generateVideoPreview(file)
  → Extract first 30 seconds
  → Reduce resolution to 480p
  → Lower bitrate
```

### **Upload Flow**

```typescript
// In UploadForm.tsx
const uploadToIPFS = async (file, metadata) => {
  // 1. Encrypt original
  const encryptedFile = await encryptFile(file, key);
  
  // 2. Generate preview
  const previewFile = await generatePreview(file, mediaType);
  
  // 3. Upload both
  const fileCID = await uploadFileToPinata(encryptedFile);      // Encrypted
  const previewCID = await uploadFileToPinata(previewFile);    // Degraded
  
  return { fileCID, previewCID, key };
};
```

---

## 🚨 Important Notes

### **Video Preview Limitation**

Browser-based video processing is limited. For production:

**Option 1: Server-Side Processing**
- Use FFmpeg on backend
- Generate 30s preview at 480p
- Upload to IPFS automatically

**Option 2: Cloud Services**
- Use Cloudinary / Mux for video processing
- Automatic preview generation
- CDN delivery

**Option 3: Manual Upload**
- Ask creators to upload preview separately
- Simple but requires extra work

### **Current Implementation**

- ✅ **Images**: Fully automated watermarking
- ✅ **Audio**: Fully automated truncation
- ⚠️ **Video**: Falls back to original (needs server)
- ⚠️ **VFX**: Falls back to original (custom needed)

---

## 🔮 Future Enhancements

### **Advanced Watermarking**
- Custom watermark text/logo
- Dynamic positioning
- Invisible watermarks (steganography)
- Forensic watermarking

### **Quality Tiers**
- Free: Ultra-low quality preview
- Paid (Tier 1): Medium quality
- Paid (Tier 2): Full quality
- Paid (Tier 3): Original + source files

### **Time-Limited Previews**
- Preview access expires after X days
- Prevents repeated free viewing
- Forces purchase for continued access

### **Geo-Restrictions**
- Preview available globally
- Full files restricted by region
- Licensing by territory

---

## 🎯 Best Practices for Creators

### **When Uploading**

1. **Use High-Quality Originals**
   - Upload your best quality file
   - System will create preview automatically
   - Full quality only goes to paying customers

2. **Don't Pre-Watermark**
   - System adds watermarks automatically
   - Your original stays clean
   - Buyers get unwatermarked version

3. **Trust the System**
   - Preview is degraded enough to prevent theft
   - But good enough for evaluation
   - Your full file is encrypted

### **Pricing Strategy**

Consider preview quality when pricing:
- Higher preview quality → Lower price (more confident buyers)
- Lower preview quality → Higher price (exclusivity)
- Balance discoverability vs protection

---

## 📞 FAQ

**Q: Can someone download the preview and use it commercially?**  
A: Legally no (it's licensed content), and practically the quality is too low for professional use. Watermarks also provide legal proof.

**Q: What if someone removes the watermark?**  
A: Watermark removal is illegal (DMCA), and the reduced quality remains. Plus, you have blockchain proof of original ownership.

**Q: Can I disable previews?**  
A: Not recommended - previews increase sales by building trust. But you could make preview quality even lower.

**Q: What about audio that needs to stay secret until release?**  
A: Use a very short preview (5-10 seconds) or upload a different teaser clip as the "preview".

**Q: Are previews also on IPFS?**  
A: Yes, but they're public and unencrypted. Anyone can access them, by design.

---

**Summary**: Previews are **intentionally downloadable** but **protected by degradation**. The real value is in the full-quality encrypted file that requires payment! 🎨🔒
