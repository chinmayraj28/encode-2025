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

      // Add semi-transparent watermarks - less aggressive overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Lighter background
      ctx.font = 'bold 40px Arial'; // Smaller text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add watermark grid (4 watermarks - corners and center)
      const positions = [
        { x: width * 0.25, y: height * 0.33 },
        { x: width * 0.75, y: height * 0.33 },
        { x: width * 0.5, y: height * 0.5 },
        { x: width * 0.5, y: height * 0.67 }
      ];
      
      positions.forEach(pos => {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(-Math.PI / 6);
        
        // Subtle shadow for better visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillText('PREVIEW', 2, 2);
        
        // White text with lower opacity
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('PREVIEW', 0, 0);
        ctx.restore();
      });
      
      // Add semi-transparent bars at top and bottom
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // More transparent
      ctx.fillRect(0, 0, width, 50);
      ctx.fillRect(0, height - 50, width, 50);
      
      // Add warning text at top
      ctx.fillStyle = 'rgba(139, 92, 246, 0.9)'; // Purple instead of red
      ctx.font = 'bold 18px Arial'; // Smaller font
      ctx.fillText('⚠️ WATERMARKED PREVIEW - PURCHASE TO UNLOCK', width / 2, 25);
      
      // Convert to blob with better quality
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
        0.5 // Better quality (50% instead of 30%)
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

        // Add MODERATE audio watermark: beeps every 3 seconds
        const beepInterval = 3; // seconds (less frequent)
        const beepDuration = 0.2; // seconds (shorter beeps)
        const beepFrequency = 1000; // Hz

        // Create oscillator for each beep
        for (let time = 1.5; time < previewDuration; time += beepInterval) {
          const oscillator = offlineContext.createOscillator();
          const gainNode = offlineContext.createGain();

          oscillator.frequency.value = beepFrequency;
          oscillator.connect(gainNode);
          gainNode.connect(offlineContext.destination);

          // Moderate volume beeps
          gainNode.gain.setValueAtTime(0, time);
          gainNode.gain.linearRampToValueAtTime(0.4, time + 0.01); // Lower volume
          gainNode.gain.setValueAtTime(0.4, time + beepDuration - 0.01);
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
 * Creates a 2x2 grid of frames from different moments in the video
 */
export async function generateVideoPreview(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    console.log('🎥 Generating video preview with multi-frame collage...');
    
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    const url = URL.createObjectURL(file);
    video.src = url;
    
    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        const width = video.videoWidth;
        const height = video.videoHeight;
        
        console.log('📹 Video metadata:', { duration, width, height });
        
        // Calculate frame size for 2x2 grid (each frame max 400x300)
        const maxFrameWidth = 400;
        const maxFrameHeight = 300;
        const aspectRatio = width / height;
        
        let frameWidth = width;
        let frameHeight = height;
        
        if (width > maxFrameWidth || height > maxFrameHeight) {
          if (aspectRatio > maxFrameWidth / maxFrameHeight) {
            frameWidth = maxFrameWidth;
            frameHeight = maxFrameWidth / aspectRatio;
          } else {
            frameHeight = maxFrameHeight;
            frameWidth = maxFrameHeight * aspectRatio;
          }
        }
        
        // Create main canvas for 2x2 grid with spacing
        const spacing = 10;
        const gridWidth = (frameWidth * 2) + (spacing * 3);
        const gridHeight = (frameHeight * 2) + (spacing * 3) + 60; // Extra for top banner
        
        const canvas = document.createElement('canvas');
        canvas.width = gridWidth;
        canvas.height = gridHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // Dark background
        ctx.fillStyle = '#0f0f1e';
        ctx.fillRect(0, 0, gridWidth, gridHeight);
        
        // Timestamps to capture (10%, 35%, 60%, 85%)
        const timestamps = [
          { time: duration * 0.10, label: 'Start' },
          { time: duration * 0.35, label: 'Early' },
          { time: duration * 0.60, label: 'Middle' },
          { time: duration * 0.85, label: 'End' }
        ];
        
        let frameIndex = 0;
        
        const captureFrame = async () => {
          if (frameIndex >= timestamps.length) {
            // All frames captured, now add watermarks and finish
            finishPreview();
            return;
          }
          
          const timestamp = timestamps[frameIndex];
          video.currentTime = Math.min(timestamp.time, duration - 0.5);
          
          video.onseeked = () => {
            try {
              // Calculate position in 2x2 grid
              const col = frameIndex % 2;
              const row = Math.floor(frameIndex / 2);
              const x = spacing + (col * (frameWidth + spacing));
              const y = 60 + spacing + (row * (frameHeight + spacing));
              
              // Draw video frame
              ctx.drawImage(video, x, y, frameWidth, frameHeight);
              
              // Add frame border
              ctx.strokeStyle = '#8b5cf6';
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, frameWidth, frameHeight);
              
              // Add timestamp label
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.fillRect(x + 5, y + 5, 80, 25);
              ctx.fillStyle = '#a78bfa';
              ctx.font = 'bold 12px Arial';
              ctx.textAlign = 'left';
              ctx.fillText(timestamp.label, x + 10, y + 20);
              
              frameIndex++;
              
              // Small delay before capturing next frame
              setTimeout(captureFrame, 100);
            } catch (error) {
              URL.revokeObjectURL(url);
              reject(error);
            }
          };
        };
        
        const finishPreview = () => {
          try {
            // Apply visible degradation overlay over entire grid
            ctx.fillStyle = 'rgba(139, 92, 246, 0.12)';
            ctx.fillRect(0, 60, gridWidth, gridHeight - 60);
            
            // Add diagonal watermarks across the entire collage
            const watermarkPositions = [
              { x: gridWidth * 0.25, y: gridHeight * 0.35 },
              { x: gridWidth * 0.75, y: gridHeight * 0.45 },
              { x: gridWidth * 0.5, y: gridHeight * 0.65 }
            ];
            
            watermarkPositions.forEach(pos => {
              ctx.save();
              ctx.translate(pos.x, pos.y);
              ctx.rotate(-Math.PI / 6);
              
              // Shadow for visibility
              ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
              ctx.font = `bold ${Math.max(36, gridWidth / 20)}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('PREVIEW', 2, 2);
              
              // Main text
              ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
              ctx.fillText('PREVIEW', 0, 0);
              ctx.restore();
            });
            
            // Top banner
            const bannerHeight = 50;
            ctx.fillStyle = 'rgba(139, 92, 246, 0.95)';
            ctx.fillRect(0, 0, gridWidth, bannerHeight);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ VIDEO PREVIEW - 4 FRAMES - PURCHASE FOR FULL VIDEO', gridWidth / 2, bannerHeight / 2 + 3);
            
            // Duration info badge
            const durationText = `Duration: ${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(spacing, gridHeight - 40, 200, 30);
            ctx.fillStyle = '#a78bfa';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(durationText, spacing + 10, gridHeight - 20);
            
            // Warning at bottom right
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(gridWidth - 250, gridHeight - 40, 240, 30);
            ctx.fillStyle = '#9ca3af';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('Purchase for full video', gridWidth - 15, gridHeight - 20);
            
            // Convert to blob
            canvas.toBlob(
              (blob) => {
                URL.revokeObjectURL(url);
                if (blob) {
                  const previewFile = new File([blob], `preview_${file.name}.jpg`, {
                    type: 'image/jpeg',
                  });
                  console.log('✅ Video preview 4-frame collage generated:', {
                    size: previewFile.size,
                    type: previewFile.type,
                    name: previewFile.name,
                    dimensions: `${gridWidth}x${gridHeight}`,
                    frames: timestamps.length
                  });
                  resolve(previewFile);
                } else {
                  reject(new Error('Failed to create preview blob'));
                }
              },
              'image/jpeg',
              0.75
            );
          } catch (error) {
            URL.revokeObjectURL(url);
            reject(error);
          }
        };
        
        // Start capturing frames
        captureFrame();
        
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata'));
    };
  });
}

/**
 * Generate preview for 3D models - creates a 3x2 grid of model screenshots from 6 angles
 * Uses Three.js to render actual 3D model from different viewpoints
 */
export async function generate3DModelPreview(file: File): Promise<File> {
  return new Promise(async (resolve, reject) => {
    console.log('🧊 Generating 3D model preview grid with Three.js...');
    
    try {
      // Dynamically import Three.js to avoid SSR issues
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
      const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
      
      // Create main canvas for the 3x2 grid
      const gridCanvas = document.createElement('canvas');
      const gridCtx = gridCanvas.getContext('2d');
      
      if (!gridCtx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Grid dimensions: 3 columns x 2 rows, each cell 400x400
      const cellWidth = 400;
      const cellHeight = 400;
      gridCanvas.width = cellWidth * 3; // 1200px
      gridCanvas.height = cellHeight * 2; // 800px
      
      // Dark background
      gridCtx.fillStyle = '#0f0f1e';
      gridCtx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
      
      // Create Three.js scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight1.position.set(5, 5, 5);
      scene.add(directionalLight1);
      
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight2.position.set(-5, -5, -5);
      scene.add(directionalLight2);
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(cellWidth, cellHeight);
      renderer.setClearColor(0x1a1a2e);
      
      // Determine file type and load model
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.split('.').pop() || '';
      
      let model: any = null;
      
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer]);
      const url = URL.createObjectURL(blob);
      
      // Load model based on file type
      if (fileExtension === 'glb' || fileExtension === 'gltf') {
        const loader = new GLTFLoader();
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });
        model = gltf.scene;
      } else if (fileExtension === 'obj') {
        const loader = new OBJLoader();
        model = await new Promise<any>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });
      } else if (fileExtension === 'stl') {
        const loader = new STLLoader();
        const geometry = await new Promise<any>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });
        const material = new THREE.MeshPhongMaterial({ color: 0x8b5cf6, specular: 0x111111, shininess: 200 });
        model = new THREE.Mesh(geometry, material);
      } else if (fileExtension === 'fbx') {
        const loader = new FBXLoader();
        model = await new Promise<any>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });
      } else {
        // Fallback for unsupported formats
        console.warn('⚠️ Unsupported 3D format, creating placeholder grid');
        URL.revokeObjectURL(url);
        return resolve(await generatePlaceholder3DGrid(file));
      }
      
      if (!model) {
        URL.revokeObjectURL(url);
        return resolve(await generatePlaceholder3DGrid(file));
      }
      
      scene.add(model);
      
      // Center and scale model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.5 / maxDim;
      
      model.position.sub(center);
      model.scale.setScalar(scale);
      
      // Camera
      const camera = new THREE.PerspectiveCamera(45, cellWidth / cellHeight, 0.1, 1000);
      
      // Define 6 camera positions for different views
      const cameraPositions = [
        { name: 'FRONT', pos: new THREE.Vector3(0, 0, 5), label: 'Front View' },
        { name: 'BACK', pos: new THREE.Vector3(0, 0, -5), label: 'Back View' },
        { name: 'LEFT', pos: new THREE.Vector3(-5, 0, 0), label: 'Left View' },
        { name: 'RIGHT', pos: new THREE.Vector3(5, 0, 0), label: 'Right View' },
        { name: 'TOP', pos: new THREE.Vector3(0, 5, 0), label: 'Top View' },
        { name: 'BOTTOM', pos: new THREE.Vector3(0, -5, 0), label: 'Bottom View' },
      ];
      
      // Render each view
      for (let i = 0; i < 6; i++) {
        const view = cameraPositions[i];
        camera.position.copy(view.pos);
        camera.lookAt(0, 0, 0);
        
        renderer.render(scene, camera);
        
        // Get rendered image
        const renderedCanvas = renderer.domElement;
        
        // Calculate position in grid (3 columns x 2 rows)
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = col * cellWidth;
        const y = row * cellHeight;
        
        // Draw rendered view to grid
        gridCtx.drawImage(renderedCanvas, x, y, cellWidth, cellHeight);
        
        // Add view label with semi-transparent background
        gridCtx.fillStyle = 'rgba(139, 92, 246, 0.8)';
        gridCtx.fillRect(x + 10, y + 10, 180, 35);
        gridCtx.fillStyle = '#ffffff';
        gridCtx.font = 'bold 18px Arial';
        gridCtx.fillText(view.label, x + 20, y + 35);
        
        // Add "PREVIEW" text at bottom
        gridCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        gridCtx.fillRect(x + 10, y + cellHeight - 45, 180, 35);
        gridCtx.fillStyle = '#a78bfa';
        gridCtx.font = '14px Arial';
        gridCtx.fillText('Watermarked Preview', x + 20, y + cellHeight - 20);
        
        // Draw border
        gridCtx.strokeStyle = '#333';
        gridCtx.lineWidth = 2;
        gridCtx.strokeRect(x, y, cellWidth, cellHeight);
      }
      
      // Add overall watermark overlay (lighter)
      gridCtx.fillStyle = 'rgba(139, 92, 246, 0.05)'; // Much lighter
      gridCtx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
      
      // Central diagonal watermark (more subtle)
      gridCtx.save();
      gridCtx.translate(gridCanvas.width / 2, gridCanvas.height / 2);
      gridCtx.rotate(-Math.PI / 6);
      gridCtx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // More subtle
      gridCtx.font = 'bold 60px Arial'; // Smaller text
      gridCtx.textAlign = 'center';
      gridCtx.fillText('3D PREVIEW', 0, 0);
      gridCtx.restore();
      
      // Top banner (less intrusive)
      gridCtx.fillStyle = 'rgba(139, 92, 246, 0.85)'; // More transparent
      gridCtx.fillRect(0, 0, gridCanvas.width, 50);
      gridCtx.fillStyle = '#ffffff';
      gridCtx.font = 'bold 20px Arial'; // Slightly smaller
      gridCtx.textAlign = 'center';
      gridCtx.fillText('⚠️ PREVIEW - PURCHASE FOR FULL 3D MODEL', gridCanvas.width / 2, 30);
      
      // Bottom file info (more subtle)
      gridCtx.fillStyle = 'rgba(0, 0, 0, 0.75)'; // More transparent
      gridCtx.fillRect(0, gridCanvas.height - 50, gridCanvas.width, 50);
      gridCtx.fillStyle = '#a78bfa';
      gridCtx.font = '14px Arial'; // Smaller font
      gridCtx.fillText(`File: ${file.name}`, gridCanvas.width / 2, gridCanvas.height - 30);
      gridCtx.fillStyle = '#9ca3af';
      gridCtx.font = '12px Arial'; // Smaller font
      gridCtx.fillText('Preview only - Full model requires purchase', gridCanvas.width / 2, gridCanvas.height - 12);
      
      // Clean up
      URL.revokeObjectURL(url);
      renderer.dispose();
      
      // Convert to blob
      gridCanvas.toBlob(
        (blob) => {
          if (blob) {
            const previewFile = new File([blob], `preview_${file.name}.jpg`, {
              type: 'image/jpeg',
            });
            console.log('✅ 3D model preview grid generated with actual model renders');
            resolve(previewFile);
          } else {
            reject(new Error('Failed to create preview blob'));
          }
        },
        'image/jpeg',
        0.75 // Reasonable quality
      );
      
    } catch (error) {
      console.error('❌ Failed to render 3D model:', error);
      console.log('📦 Falling back to placeholder grid');
      // Fallback to placeholder grid if rendering fails
      resolve(await generatePlaceholder3DGrid(file));
    }
  });
}

/**
 * Generate a placeholder grid when 3D rendering fails
 */
async function generatePlaceholder3DGrid(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    // Create 1200x800 preview grid (3x2 layout)
    const cellWidth = 400;
    const cellHeight = 400;
    canvas.width = cellWidth * 3;
    canvas.height = cellHeight * 2;
    
    // Dark background
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Labels for each view
    const views = [
      'Front View',
      'Back View',
      'Left View',
      'Right View',
      'Top View',
      'Bottom View'
    ];
    
    // Draw placeholder for each view
    views.forEach((label, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = col * cellWidth;
      const y = row * cellHeight;
      
      // Cell background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(x, y, cellWidth, cellHeight);
      
      // Draw 3D box icon
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 4;
      
      // Simple wireframe cube
      const centerX = x + cellWidth / 2;
      const centerY = y + cellHeight / 2;
      const size = 80;
      
      // Back face
      ctx.strokeRect(centerX - size - 15, centerY - size - 15, size, size);
      // Front face
      ctx.strokeRect(centerX - 15, centerY - 15, size, size);
      // Connect corners
      ctx.beginPath();
      ctx.moveTo(centerX - size - 15, centerY - size - 15);
      ctx.lineTo(centerX - 15, centerY - 15);
      ctx.moveTo(centerX + size - 15, centerY - size - 15);
      ctx.lineTo(centerX + size - 15, centerY - 15);
      ctx.moveTo(centerX - size - 15, centerY + size - 15);
      ctx.lineTo(centerX - 15, centerY + size - 15);
      ctx.moveTo(centerX + size - 15, centerY + size - 15);
      ctx.lineTo(centerX + size - 15, centerY + size - 15);
      ctx.stroke();
      
      // View label
      ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
      ctx.fillRect(x + 10, y + 10, 180, 35);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 20, y + 35);
      
      // "Preview" text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x + 10, y + cellHeight - 45, 180, 35);
      ctx.fillStyle = '#a78bfa';
      ctx.font = '14px Arial';
      ctx.fillText('Placeholder Preview', x + 20, y + cellHeight - 20);
      
      // Border
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cellWidth, cellHeight);
    });
    
    // Main watermark overlay
    ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Central watermark
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('3D PREVIEW', 0, 0);
    ctx.restore();
    
    // Top banner
    ctx.fillStyle = 'rgba(139, 92, 246, 0.95)';
    ctx.fillRect(0, 0, canvas.width, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ PREVIEW - PURCHASE FOR FULL 3D MODEL ⚠️', canvas.width / 2, 38);
    
    // File info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    ctx.fillStyle = '#a78bfa';
    ctx.font = '16px Arial';
    ctx.fillText(`File: ${file.name}`, canvas.width / 2, canvas.height - 35);
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText('Placeholder preview - Full model requires purchase', canvas.width / 2, canvas.height - 15);
    
    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const previewFile = new File([blob], `preview_${file.name}.jpg`, {
            type: 'image/jpeg',
          });
          console.log('✅ 3D model placeholder grid generated');
          resolve(previewFile);
        } else {
          reject(new Error('Failed to create preview blob'));
        }
      },
      'image/jpeg',
      0.75
    );
  });
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
 * Prioritizes actual MIME type detection over user-selected media type
 */
export async function generatePreview(file: File, mediaType: string): Promise<File> {
  console.log(`🎬 Generating preview for ${mediaType}:`, file.name, `(MIME: ${file.type})`);

  try {
    const type = mediaType.toLowerCase();
    const mimeType = file.type.toLowerCase();

    // PRIORITY 1: Detect by actual MIME type (more reliable)
    if (mimeType.startsWith('video/')) {
      console.log('📹 Detected video file by MIME type, generating video preview');
      return await generateVideoPreview(file);
    } else if (mimeType.startsWith('image/')) {
      console.log('🖼️ Detected image file by MIME type, generating image preview');
      return await generateImagePreview(file);
    } else if (mimeType.startsWith('audio/')) {
      console.log('🎵 Detected audio file by MIME type, generating audio preview');
      return await generateAudioPreview(file);
    }
    
    // PRIORITY 2: Fallback to user-selected media type
    if (type === 'vfx' || type === 'video') {
      console.log('📹 Video type selected, generating video preview');
      return await generateVideoPreview(file);
    } else if (type === 'visual') {
      console.log('🖼️ Visual type selected, generating image preview');
      return await generateImagePreview(file);
    } else if (type === 'audio' || type === 'sfx') {
      console.log('🎵 Audio type selected, generating audio preview');
      return await generateAudioPreview(file);
    } else if (type === '3d') {
      console.log('🧊 3D model type selected, generating 3D preview');
      return await generate3DModelPreview(file);
    } else {
      console.warn(`⚠️ Unknown media type: ${type}, MIME: ${mimeType}, using original file as preview`);
      return file;
    }
  } catch (error) {
    console.error('❌ Preview generation failed:', error);
    console.warn('⚠️ Falling back to original file as preview');
    return file; // Fallback to original if preview generation fails
  }
}
