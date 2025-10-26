/**
 * File validation utilities for media asset uploads
 * Ensures uploaded files match their declared media types
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Define allowed MIME types for each media category
const MEDIA_TYPE_VALIDATORS: Record<string, {
  mimeTypes: string[];
  extensions: string[];
  label: string;
}> = {
  audio: {
    mimeTypes: [
      'audio/mpeg',           // .mp3
      'audio/wav',            // .wav
      'audio/wave',           // .wav (alternative)
      'audio/x-wav',          // .wav (alternative)
      'audio/ogg',            // .ogg
      'audio/aac',            // .aac
      'audio/flac',           // .flac
      'audio/x-flac',         // .flac (alternative)
      'audio/mp4',            // .m4a
      'audio/x-m4a',          // .m4a (alternative)
      'audio/webm',           // .webm audio
    ],
    extensions: ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.webm'],
    label: 'Audio files',
  },
  visual: {
    mimeTypes: [
      'image/jpeg',           // .jpg, .jpeg
      'image/png',            // .png
      'image/gif',            // .gif
      'image/webp',           // .webp
      'image/svg+xml',        // .svg
      'image/bmp',            // .bmp
      'image/tiff',           // .tiff
      'video/mp4',            // .mp4
      'video/webm',           // .webm
      'video/ogg',            // .ogv
      'video/quicktime',      // .mov
      'video/x-msvideo',      // .avi
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.mp4', '.webm', '.ogv', '.mov', '.avi'],
    label: 'Images and videos',
  },
  vfx: {
    mimeTypes: [
      'video/mp4',            // .mp4
      'video/webm',           // .webm
      'video/quicktime',      // .mov
      'video/x-msvideo',      // .avi
      'video/ogg',            // .ogv
      'application/x-aftereffects', // After Effects (custom)
    ],
    extensions: ['.mp4', '.webm', '.mov', '.avi', '.ogv', '.aep'],
    label: 'VFX and video effects',
  },
  sfx: {
    mimeTypes: [
      'audio/mpeg',           // .mp3
      'audio/wav',            // .wav
      'audio/wave',           // .wav (alternative)
      'audio/x-wav',          // .wav (alternative)
      'audio/ogg',            // .ogg
      'audio/aac',            // .aac
      'audio/flac',           // .flac
      'audio/x-flac',         // .flac (alternative)
      'audio/mp4',            // .m4a
      'audio/x-m4a',          // .m4a (alternative)
    ],
    extensions: ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a'],
    label: 'Sound effects',
  },
  '3d': {
    mimeTypes: [
      'model/gltf-binary',     // .glb
      'model/gltf+json',       // .gltf
      'application/octet-stream', // Generic binary (for .fbx, .obj, .stl, .blend)
      'text/plain',            // .obj (sometimes detected as text)
    ],
    extensions: ['.glb', '.gltf', '.fbx', '.obj', '.stl', '.blend'],
    label: '3D models',
  },
};

/**
 * Validates if a file matches the declared media type
 * @param file - The file to validate
 * @param mediaType - The declared media type (audio, visual, vfx, sfx, 3d)
 * @returns ValidationResult with isValid boolean and optional error message
 */
export function validateFileType(file: File, mediaType: string): ValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: 'No file selected',
    };
  }

  const validator = MEDIA_TYPE_VALIDATORS[mediaType];
  
  if (!validator) {
    return {
      isValid: false,
      error: `Unknown media type: ${mediaType}`,
    };
  }

  // Get file extension
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  
  // Check extension first (more reliable for binary formats like .blend)
  const extensionMatches = validator.extensions.some(ext => 
    fileName.endsWith(ext.toLowerCase())
  );

  // Check MIME type
  const mimeMatches = validator.mimeTypes.some(mime => 
    file.type === mime || file.type.startsWith(mime.split('/')[0] + '/')
  );

  // Special handling for 3D models (MIME type often unreliable)
  if (mediaType === '3d') {
    if (extensionMatches) {
      return { isValid: true };
    }
    return {
      isValid: false,
      error: `Invalid 3D model format. Expected ${validator.extensions.join(', ')}. Got: ${fileExtension || 'unknown'}`,
    };
  }

  // For other media types, check both MIME and extension
  if (extensionMatches || mimeMatches) {
    return { isValid: true };
  }

  // Build helpful error message
  const detectedType = file.type || 'unknown';
  const expectedFormats = validator.extensions.slice(0, 5).join(', ');
  const moreFormats = validator.extensions.length > 5 ? ` and ${validator.extensions.length - 5} more` : '';

  return {
    isValid: false,
    error: `File type mismatch! Expected ${validator.label} (${expectedFormats}${moreFormats}). Got: ${fileExtension || detectedType}`,
  };
}

/**
 * Get user-friendly accept attribute for file input based on media type
 * @param mediaType - The media type
 * @returns Comma-separated string of accepted file types for input[type=file] accept attribute
 */
export function getAcceptedFileTypes(mediaType: string): string {
  const validator = MEDIA_TYPE_VALIDATORS[mediaType];
  if (!validator) return '*/*';
  
  // Return both MIME types and extensions for better browser support
  const mimes = validator.mimeTypes.join(',');
  const exts = validator.extensions.join(',');
  return `${mimes},${exts}`;
}

/**
 * Get human-readable list of supported formats for a media type
 * @param mediaType - The media type
 * @returns User-friendly string describing accepted formats
 */
export function getSupportedFormatsDescription(mediaType: string): string {
  const validator = MEDIA_TYPE_VALIDATORS[mediaType];
  if (!validator) return 'All formats';
  
  return `Supported: ${validator.extensions.join(', ').toUpperCase()}`;
}

/**
 * Validate file size (optional - helps prevent huge uploads)
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in megabytes (default: 500MB)
 * @returns ValidationResult
 */
export function validateFileSize(file: File, maxSizeMB: number = 500): ValidationResult {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      isValid: false,
      error: `File too large! Maximum size is ${maxSizeMB}MB. Your file is ${fileSizeMB}MB.`,
    };
  }
  
  return { isValid: true };
}

/**
 * Comprehensive validation combining type and size checks
 * @param file - The file to validate
 * @param mediaType - The declared media type
 * @param maxSizeMB - Maximum file size in MB (optional)
 * @returns ValidationResult
 */
export function validateFile(
  file: File, 
  mediaType: string, 
  maxSizeMB?: number
): ValidationResult {
  // Check type first
  const typeValidation = validateFileType(file, mediaType);
  if (!typeValidation.isValid) {
    return typeValidation;
  }
  
  // Then check size if specified
  if (maxSizeMB !== undefined) {
    const sizeValidation = validateFileSize(file, maxSizeMB);
    if (!sizeValidation.isValid) {
      return sizeValidation;
    }
  }
  
  return { isValid: true };
}
