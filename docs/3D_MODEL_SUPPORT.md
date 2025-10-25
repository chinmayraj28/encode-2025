# 🧊 3D Model Support

## Overview

Your NFT marketplace now supports **3D model files** with the same encryption and protection system as other media types.

---

## 📦 Supported 3D Formats

When uploading a 3D model, the following formats are accepted:

- **GLB** (Binary glTF) - Recommended ✅
- **GLTF** (JSON glTF)
- **FBX** (Autodesk)
- **OBJ** (Wavefront)
- **STL** (Stereolithography)
- **BLEND** (Blender)

---

## 🎨 Preview System

Unlike audio/visual files, 3D models use a **static preview grid** approach:

### **What Gets Generated:**

A **2x2 grid image** (600x600px) showing:
1. **Front View** (Top Left)
2. **Side View** (Top Right)
3. **Top View** (Bottom Left)
4. **Perspective View** (Bottom Right)

### **Preview Features:**

✅ **Watermarked** - Large "3D PREVIEW" watermark overlay  
✅ **Low Quality** - JPEG at 80% quality  
✅ **Static Images** - No 3D interaction in preview  
✅ **File Info** - Shows filename and warning banner  

### **Example Preview:**

```
┌──────────────┬──────────────┐
│  FRONT VIEW  │  SIDE VIEW   │
│     🧊       │     🧊       │
│   Preview    │   Preview    │
├──────────────┼──────────────┤
│   TOP VIEW   │ PERSPECTIVE  │
│     🧊       │     🧊       │
│   Preview    │   Preview    │
└──────────────┴──────────────┘
    🚨 3D PREVIEW WATERMARK 🚨
```

---

## 🔒 Security & Protection

### **Same Encryption as Other Assets:**

1. **Upload Flow:**
   ```
   User uploads .glb file
   ↓
   Preview grid generated (2x2 wireframe views)
   ↓
   Original 3D file encrypted with AES-256
   ↓
   Preview uploaded to IPFS (public)
   ↓
   Encrypted file uploaded to IPFS
   ↓
   Encryption key stored in smart contract
   ```

2. **Purchase Flow:**
   ```
   Buyer views preview grid
   ↓
   Likes the style/model
   ↓
   Purchases with ETH
   ↓
   Smart contract releases decryption key
   ↓
   Full 3D model downloaded & decrypted
   ↓
   Buyer can use in Blender/Unity/etc.
   ```

### **Why It's Secure:**

✅ **Preview shows concept only** - Static images can't be used as 3D models  
✅ **No geometry data** - Preview doesn't contain vertices/faces  
✅ **Full model encrypted** - Original file completely protected  
✅ **Blockchain verification** - Ownership tracked on-chain  

---

## 💡 Use Cases

### **For 3D Artists:**

- **Game Assets** - Characters, props, environments
- **Architecture** - Building models, interior designs
- **Product Designs** - 3D prototypes, CAD models
- **Sculptures** - Digital art, NFT collectibles
- **Animations** - Rigged characters, motion capture

### **For Buyers:**

- **Game Developers** - Purchase models for games
- **Architects** - Buy pre-made building components
- **3D Printing** - Get STL files for printing
- **VR/AR** - Models for immersive experiences
- **Education** - Teaching materials

---

## 🎯 Current Limitations

### **Preview Generation:**

⚠️ **Static Grid Only** - Currently generates a placeholder grid with wireframe cubes, not actual model renders

### **Future Enhancements:**

**Phase 1 (Current):** ✅ Basic support with static preview grid  
**Phase 2:** 🔄 Server-side rendering of actual model views using Three.js  
**Phase 3:** 🔄 Interactive 3D preview viewer (limited quality)  
**Phase 4:** 🔄 Support for textures/materials in preview  

---

## 🛠️ Technical Implementation

### **Preview Generation Code:**

```typescript
// lib/preview-generator.ts
export async function generate3DModelPreview(file: File): Promise<File> {
  // Creates a 600x600 grid with 4 placeholder views
  // Each quadrant shows a wireframe cube + view label
  // Heavy watermarking applied
  // Returns JPEG image
}
```

### **Display Components:**

```tsx
// Asset Gallery Card
{asset.mediaType === '3d' ? (
  <IPFSImage ipfsHash={asset.previewHash} />
) : ...}

// Asset Detail Page
<div className="bg-purple-900/40 border border-purple-700">
  <p>⚠️ 3D MODEL PREVIEW GRID (4 Views)</p>
  <IPFSImage ipfsHash={previewHash} />
</div>
```

---

## 📊 Comparison: 3D vs Other Media Types

| Feature | Audio | Visual | 3D Model |
|---------|-------|--------|----------|
| **Preview Type** | Truncated + beeps | Watermarked image | Static grid |
| **Preview Size** | 20 seconds | 600x450px | 600x600px |
| **Protection** | Time limit | Watermark | No geometry |
| **Quality** | Mono, low bitrate | 30% JPEG | Placeholder |
| **Encryption** | AES-256 ✅ | AES-256 ✅ | AES-256 ✅ |
| **Usable Preview?** | ❌ Too short | ❌ Too low-res | ❌ No 3D data |

---

## 🚀 Upgrading Preview Quality

### **Option 1: Server-Side Rendering (Recommended)**

Use Three.js on the backend to render actual model views:

```bash
npm install three
```

```typescript
// Server-side preview generation
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

async function render3DModelViews(modelFile) {
  // Load model
  // Create 4 cameras (front, side, top, perspective)
  // Render each view to canvas
  // Combine into 2x2 grid
  // Apply watermark
  // Return image
}
```

### **Option 2: Cloud Services**

Use services like **Sketchfab API** or **Poly Haven** to generate thumbnails.

### **Option 3: Client-Side Three.js**

Add interactive preview (buyers can rotate):

```typescript
// Limited quality preview with Three.js viewer
// Load low-poly version
// Disable download
// Watermark overlay
```

---

## 💰 Pricing Strategy for 3D Models

### **Recommended Pricing:**

- **Simple models** (< 10k polygons): 0.01-0.05 ETH
- **Medium complexity** (10k-100k polygons): 0.05-0.2 ETH
- **High detail** (> 100k polygons): 0.2-1 ETH
- **With textures/materials**: +50% premium
- **Rigged/animated**: +100% premium

### **Considerations:**

✅ **File size** - Larger files = more value  
✅ **Polygon count** - Higher detail = higher price  
✅ **Textures included** - Materials increase value  
✅ **Rigging/animation** - Rigged models worth more  
✅ **Commercial license** - Allow buyers to use in projects  

---

## 🎓 Best Practices for Creators

### **When Uploading 3D Models:**

1. **✅ Optimize your model** - Reduce unnecessary polygons
2. **✅ Include materials** - Embed textures in GLB format
3. **✅ Test the file** - Ensure it opens in Blender/Unity
4. **✅ Set fair price** - Match complexity to price
5. **✅ Add description** - Explain what's included
6. **✅ Specify usage rights** - Commercial vs personal use

### **File Format Recommendations:**

| Format | Best For | Notes |
|--------|----------|-------|
| **GLB** ⭐ | Everything | Single file, includes textures |
| **GLTF** | Web/AR | Open standard, widely supported |
| **FBX** | Game engines | Good for Unity/Unreal |
| **OBJ** | 3D printing | Simple geometry only |
| **STL** | 3D printing | No textures, mesh only |

---

## ❓ FAQ

**Q: Can buyers view the 3D model before purchasing?**  
A: They see a preview grid, but not the actual 3D geometry. This protects your work.

**Q: What happens if I upload a 10GB 3D file?**  
A: IPFS will store it, but upload may be slow. Recommended max size: 100MB.

**Q: Can I include textures?**  
A: Yes! GLB format includes textures. They're encrypted with the model.

**Q: Does the preview show textures?**  
A: Currently no (placeholder grid). Future updates will render actual model previews.

**Q: Can buyers use the model commercially?**  
A: Specify in your description. You can set "personal use only" or "commercial license".

**Q: What if my model is animated?**  
A: Upload the rigged model. Buyers get the full rig + animations after purchase.

---

## 🔮 Roadmap

### **Q1 2026: Enhanced Preview**
- Server-side Three.js rendering
- Actual model views (not placeholders)
- Show textures in preview

### **Q2 2026: Interactive Preview**
- Client-side 3D viewer
- Rotate/zoom (limited quality)
- WebGL-based preview

### **Q3 2026: Advanced Features**
- Multi-file support (textures separate)
- Animation preview clips
- Material preview

---

## 🎉 Summary

Your marketplace now supports 3D models with:

✅ **Full encryption** - Same security as audio/visual  
✅ **Preview grid** - 2x2 static preview  
✅ **All formats** - GLB, GLTF, FBX, OBJ, STL, BLEND  
✅ **Smart contract** - On-chain ownership  
✅ **Watermarked** - Protected preview  
✅ **Decryption** - Auto-decrypt after purchase  

**Upload your 3D models now and start earning! 🚀🧊**
