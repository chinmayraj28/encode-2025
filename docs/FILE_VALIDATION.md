# File Type Validation System

## Overview

Media Mercatum now includes comprehensive file type validation to ensure uploaded files match their declared media categories. This prevents users from accidentally (or maliciously) uploading wrong file types to incorrect categories.

## Features

### ✅ Strict Type Checking
- **MIME Type Validation**: Checks the file's MIME type reported by the browser
- **Extension Validation**: Validates file extension against allowed formats
- **Dual Verification**: Uses both checks for maximum accuracy
- **File Size Limits**: Enforces 500MB maximum file size

### 📋 Supported Formats by Category

#### 🎵 Audio
- **Extensions**: `.mp3`, `.wav`, `.ogg`, `.aac`, `.flac`, `.m4a`, `.webm`
- **Use Case**: Music tracks, beats, background audio
- **MIME Types**: `audio/mpeg`, `audio/wav`, `audio/ogg`, `audio/aac`, `audio/flac`, `audio/mp4`

#### 🎨 Visual
- **Extensions**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.bmp`, `.tiff`, `.mp4`, `.webm`, `.ogv`, `.mov`, `.avi`
- **Use Case**: Images, artwork, general video content
- **MIME Types**: `image/*`, `video/mp4`, `video/webm`, `video/quicktime`

#### ✨ VFX
- **Extensions**: `.mp4`, `.webm`, `.mov`, `.avi`, `.ogv`, `.aep`
- **Use Case**: Visual effects, motion graphics, compositing
- **MIME Types**: `video/mp4`, `video/webm`, `video/quicktime`, `video/x-msvideo`

#### 🔊 SFX
- **Extensions**: `.mp3`, `.wav`, `.ogg`, `.aac`, `.flac`, `.m4a`
- **Use Case**: Sound effects, foley, UI sounds
- **MIME Types**: `audio/mpeg`, `audio/wav`, `audio/ogg`, `audio/aac`, `audio/flac`

#### 🧊 3D Models
- **Extensions**: `.glb`, `.gltf`, `.fbx`, `.obj`, `.stl`, `.blend`
- **Use Case**: 3D assets, models, scenes
- **MIME Types**: `model/gltf-binary`, `model/gltf+json`, `application/octet-stream`
- **Note**: MIME detection is unreliable for 3D files, so extension validation is primary

## How It Works

### 1. File Selection Validation
When a user selects a file:
```typescript
// Automatic validation on file selection
const validation = validateFile(selectedFile, mediaType, 500);

if (!validation.isValid) {
  // Show error toast
  // Clear file selection
  // Display error message
}
```

### 2. Media Type Change Validation
When user changes media type after selecting a file:
```typescript
// Re-validate existing file against new media type
if (file) {
  const validation = validateFile(file, newMediaType, 500);
  
  if (!validation.isValid) {
    // File incompatible with new category
    // Automatically removed
    // User notified
  }
}
```

### 3. Pre-Upload Validation
Additional validation before IPFS upload ensures integrity:
- File must exist
- Must pass type validation
- Must pass size validation
- Title and description required

## User Experience

### ✅ Valid File
```
✓ lofi-beat.mp3 validated successfully
Selected: lofi-beat.mp3 (4.52 MB)
```

### ❌ Invalid File Type
```
❌ File type mismatch! Expected Audio files (.mp3, .wav, .ogg, .aac, .flac). Got: .mp4
```

### ❌ File Too Large
```
❌ File too large! Maximum size is 500MB. Your file is 612.45MB.
```

### 🔄 Media Type Changed
```
✓ File is compatible with audio
```
or
```
File removed: File type mismatch! Expected VFX and video effects...
```

## Technical Implementation

### File Validation Utility (`lib/file-validation.ts`)

#### Core Functions

1. **`validateFileType(file, mediaType)`**
   - Checks MIME type and extension
   - Returns `{ isValid: boolean, error?: string }`
   - Special handling for 3D models (unreliable MIME)

2. **`validateFileSize(file, maxSizeMB)`**
   - Enforces size limits
   - Default: 500MB
   - Prevents IPFS upload failures

3. **`validateFile(file, mediaType, maxSizeMB?)`**
   - Comprehensive validation combining both checks
   - Single function for all validation needs

4. **`getAcceptedFileTypes(mediaType)`**
   - Returns HTML5 `accept` attribute value
   - Used in file input to pre-filter browser file picker
   - Example: `audio/mpeg,audio/wav,.mp3,.wav,...`

5. **`getSupportedFormatsDescription(mediaType)`**
   - Human-readable format list
   - Used in UI hints
   - Example: "Supported: .MP3, .WAV, .OGG, .AAC, .FLAC"

### Integration Points

#### UploadForm Component
```tsx
// Import validation utilities
import { 
  validateFile, 
  getAcceptedFileTypes, 
  getSupportedFormatsDescription 
} from '@/lib/file-validation';

// Validate on file selection
const handleFileChange = (e) => {
  const validation = validateFile(file, mediaType, 500);
  // Handle validation result
};

// Re-validate on media type change
const handleMediaTypeChange = (newType) => {
  if (file) {
    const validation = validateFile(file, newType, 500);
    // Handle validation result
  }
};

// Set accept attribute for better UX
<input 
  type="file" 
  accept={getAcceptedFileTypes(mediaType)}
/>
```

## Validation Rules

### Rule Priority
1. **Extension Check** (Primary for 3D models)
2. **MIME Type Check** (Primary for audio/video/image)
3. **File Size Check** (Applied last)

### Why Both Extension and MIME?
- **MIME Types**: Browser-detected, reliable for common formats
- **Extensions**: User-visible, catches renamed files
- **Combined**: Maximum protection against misclassification

### Special Cases

#### 3D Models
- MIME types often detected as `application/octet-stream`
- Relies primarily on extension validation
- Accepts: `.glb`, `.gltf`, `.fbx`, `.obj`, `.stl`, `.blend`

#### Audio Files
- Multiple MIME variants (e.g., `audio/wav` vs `audio/x-wav`)
- Comprehensive MIME list covers all variants

#### Video Files
- Shared between Visual and VFX categories
- Both accept video formats (intentional overlap)
- User chooses based on content nature

## Error Handling

### Validation Errors
```typescript
interface ValidationResult {
  isValid: boolean;
  error?: string; // User-friendly error message
}
```

### Error Messages
- **Type Mismatch**: "Expected [category] ([formats]). Got: [detected]"
- **Size Exceeded**: "File too large! Maximum size is XMB. Your file is YMB."
- **No File**: "No file selected"
- **Unknown Type**: "Unknown media type: [type]"

### User Notifications
- **Toast Notifications**: Immediate feedback via `react-hot-toast`
- **Inline Errors**: Red error boxes below file input
- **Success Confirmations**: Green checkmark with file details

## Testing Scenarios

### Test Case 1: Valid Upload
1. Select media type: Audio
2. Choose file: `song.mp3`
3. ✅ **Result**: File accepted, ready to upload

### Test Case 2: Wrong File Type
1. Select media type: Audio
2. Choose file: `video.mp4`
3. ❌ **Result**: File rejected, error shown, input cleared

### Test Case 3: Media Type Switch
1. Select file: `track.mp3` (Audio selected)
2. Change media type to: VFX
3. ❌ **Result**: File automatically removed (incompatible)

### Test Case 4: File Too Large
1. Select media type: Any
2. Choose file: `huge-file.mp4` (600MB)
3. ❌ **Result**: File rejected, size error shown

### Test Case 5: 3D Model Extension
1. Select media type: 3D Model
2. Choose file: `model.blend`
3. ✅ **Result**: File accepted (extension-based validation)

## Benefits

### For Users
- ✅ **Prevents Mistakes**: Can't accidentally upload wrong file types
- ✅ **Clear Feedback**: Immediate notification of issues
- ✅ **Better Discovery**: Marketplace categories remain accurate
- ✅ **File Size Protection**: Won't waste time uploading oversized files

### For Platform
- ✅ **Data Integrity**: Categories contain only correct media types
- ✅ **Better UX**: Users find what they expect in each category
- ✅ **Trust**: Professional validation builds confidence
- ✅ **Storage Efficiency**: Size limits prevent IPFS issues

## Future Enhancements

### Potential Additions
1. **Content Analysis**: Deep file inspection (beyond MIME/extension)
2. **Duration Validation**: Min/max length for audio/video
3. **Resolution Limits**: Image/video dimension requirements
4. **Format Conversion**: Auto-convert compatible formats
5. **Batch Validation**: Validate multiple files at once
6. **Custom Categories**: User-defined media types with rules

### Advanced Validation
- **Audio**: Bitrate, sample rate, channels validation
- **Video**: Codec, frame rate, aspect ratio checks
- **Images**: Minimum resolution requirements
- **3D**: Polygon count, texture validation

## API Reference

### `validateFile(file, mediaType, maxSizeMB?)`
```typescript
validateFile(
  file: File,           // File object to validate
  mediaType: string,    // 'audio' | 'visual' | 'vfx' | 'sfx' | '3d'
  maxSizeMB?: number    // Optional size limit (default: no limit)
): ValidationResult     // { isValid: boolean, error?: string }
```

### `getAcceptedFileTypes(mediaType)`
```typescript
getAcceptedFileTypes(
  mediaType: string     // 'audio' | 'visual' | 'vfx' | 'sfx' | '3d'
): string              // Comma-separated MIME types and extensions
```

### `getSupportedFormatsDescription(mediaType)`
```typescript
getSupportedFormatsDescription(
  mediaType: string     // 'audio' | 'visual' | 'vfx' | 'sfx' | '3d'
): string              // Human-readable format list
```

## Summary

The file validation system ensures **data integrity**, **better user experience**, and **marketplace trust** by preventing wrong file types from being uploaded to incorrect categories. It uses a combination of MIME type checking, extension validation, and size limits to provide comprehensive protection while maintaining a smooth upload workflow.

---

**Status**: ✅ Implemented and Active  
**Last Updated**: October 26, 2025  
**Version**: 1.0.0
