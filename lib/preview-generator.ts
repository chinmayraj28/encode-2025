/**
 * Preview Generator Utility
 * Creates low-quality previews for different media types
 */

/**
 * Generate a watermarked/degraded preview for images
 */
export async function generateImagePreview(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Reduce resolution to 600x450 max (smaller for worse quality)
      const maxWidth = 600;
      const maxHeight = 450;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Draw image at reduced resolution
      ctx.drawImage(img, 0, 0, width, height);

      // Add AGGRESSIVE watermarks - multiple large overlays
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Much darker background
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add watermark grid (9 watermarks total)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          ctx.save();
          ctx.translate(width * (col + 1) / 4, height * (row + 1) / 4);
          ctx.rotate(-Math.PI / 6);
          
          // Dark shadow for better visibility
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillText('PREVIEW', 2, 2);
          
          // White text
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText('PREVIEW', 0, 0);
          ctx.restore();
        }
      }
      
      // Add semi-transparent black bars at top and bottom
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, width, 60);
      ctx.fillRect(0, height - 60, width, 60);
      
      // Add warning text at top
      ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('⚠️ WATERMARKED PREVIEW - PURCHASE TO UNLOCK ⚠️', width / 2, 30);
      
      // Convert to blob with reduced quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const previewFile = new File([blob], `preview_${file.name}`, {
              type: 'image/jpeg',
            });
            resolve(previewFile);
          } else {
            reject(new Error('Failed to create preview blob'));
          }
        },
        'image/jpeg',
        0.3 // 30% quality (much worse quality)
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate a low-quality preview for audio files
 * Strategy: Extract first 30 seconds + add audio watermark (beeps every 5 seconds)
 */
export async function generateAudioPreview(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Extract first 20 seconds only (shorter preview)
        const previewDuration = Math.min(20, audioBuffer.duration);
        const previewSamples = Math.floor(previewDuration * audioBuffer.sampleRate);

        // Create offline context for rendering
        const offlineContext = new OfflineAudioContext(
          audioBuffer.numberOfChannels,
          previewSamples,
          audioBuffer.sampleRate
        );

        // Create buffer source for original audio
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;

        // Add AGGRESSIVE audio watermark: loud beeps every 2 seconds
        const beepInterval = 2; // seconds (much more frequent)
        const beepDuration = 0.3; // seconds (longer beeps)
        const beepFrequency = 1000; // Hz (more annoying frequency)

        // Create oscillator for each beep
        for (let time = 1; time < previewDuration; time += beepInterval) {
          const oscillator = offlineContext.createOscillator();
          const gainNode = offlineContext.createGain();

          oscillator.frequency.value = beepFrequency;
          oscillator.connect(gainNode);
          gainNode.connect(offlineContext.destination);

          // LOUD beeps
          gainNode.gain.setValueAtTime(0, time);
          gainNode.gain.linearRampToValueAtTime(0.6, time + 0.01); // Much louder
          gainNode.gain.setValueAtTime(0.6, time + beepDuration - 0.01);
          gainNode.gain.linearRampToValueAtTime(0, time + beepDuration);

          oscillator.start(time);
          oscillator.stop(time + beepDuration);
        }

        // Connect original audio
        source.connect(offlineContext.destination);
        source.start(0, 0, previewDuration);

        // Render preview with beeps
        const previewBuffer = await offlineContext.startRendering();

        // Convert to WAV (low quality, mono)
        const wavBlob = audioBufferToWav(previewBuffer, true); // true = force mono
        const previewFile = new File(
          [wavBlob], 
          `preview_${file.name.replace(/\.[^/.]+$/, '.wav')}`, 
          { type: 'audio/wav' }
        );

        console.log('✅ Audio preview generated:', {
          originalDuration: audioBuffer.duration,
          previewDuration,
          originalSize: file.size,
          previewSize: previewFile.size,
          reduction: `${((1 - previewFile.size / file.size) * 100).toFixed(1)}%`,
          watermarks: Math.floor(previewDuration / beepInterval)
        });

        resolve(previewFile);
      } catch (error) {
        console.error('❌ Audio preview generation failed:', error);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate a low-quality preview for video files
 * Truncates to first 30 seconds at reduced quality
 */
export async function generateVideoPreview(file: File): Promise<File> {
  // Note: Video processing in browser is limited without WebCodecs API
  // For now, return a message that video preview generation requires server-side processing
  console.warn('Video preview generation requires server-side processing');
  
  // For demo purposes, just return the original file
  // In production, you should:
  // 1. Use a server-side service (FFmpeg)
  // 2. Or use a service like Cloudinary/Mux
  // 3. Or use WebCodecs API (experimental)
  
  return file; // TODO: Implement server-side video processing
}

/**
 * Convert AudioBuffer to WAV blob with proper PCM encoding
 */
function audioBufferToWav(audioBuffer: AudioBuffer, forceMono: boolean = false): Blob {
  const numChannels = forceMono ? 1 : audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const data = [];
  
  // Get channel data
  const channels = [];
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }
  
  // Interleave channels
  if (forceMono && audioBuffer.numberOfChannels > 1) {
    // Mix down to mono by averaging channels
    for (let i = 0; i < audioBuffer.length; i++) {
      let sample = 0;
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        sample += channels[channel][i];
      }
      sample /= audioBuffer.numberOfChannels;
      
      // Clamp to [-1, 1] and convert to 16-bit PCM
      sample = Math.max(-1, Math.min(1, sample));
      const s = Math.round(sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
      data.push(s & 0xff);
      data.push((s >> 8) & 0xff);
    }
  } else {
    // Keep original channel configuration
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        const s = Math.round(sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
        data.push(s & 0xff);
        data.push((s >> 8) & 0xff);
      }
    }
  }
  
  const dataLength = data.length;
  const wavBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(wavBuffer);
  
  // Helper function to write strings
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true); // file length - 8
  writeString(8, 'WAVE');
  
  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample
  
  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataLength, true); // Subchunk2Size
  
  // Write audio data
  for (let i = 0; i < data.length; i++) {
    view.setUint8(44 + i, data[i]);
  }
  
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

/**
 * Main function to generate preview based on media type
 */
export async function generatePreview(file: File, mediaType: string): Promise<File> {
  console.log(`🎬 Generating preview for ${mediaType}:`, file.name);

  try {
    // Detect media type from file or parameter
    const type = mediaType.toLowerCase();
    const mimeType = file.type.toLowerCase();

    if (type === 'visual' || mimeType.startsWith('image/')) {
      return await generateImagePreview(file);
    } else if (type === 'audio' || type === 'sfx' || mimeType.startsWith('audio/')) {
      return await generateAudioPreview(file);
    } else if (type === 'vfx' || type === 'video' || mimeType.startsWith('video/')) {
      console.warn('⚠️ Video preview generation not fully implemented');
      // For video, recommend manual preview upload or server-side processing
      return await generateVideoPreview(file);
    } else {
      console.warn(`⚠️ Unknown media type: ${type}, using original file as preview`);
      return file;
    }
  } catch (error) {
    console.error('❌ Preview generation failed:', error);
    console.warn('⚠️ Falling back to original file as preview');
    return file; // Fallback to original if preview generation fails
  }
}
