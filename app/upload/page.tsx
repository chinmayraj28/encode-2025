'use client';

import Navbar from '@/components/Navbar';
import MediaUploader from '@/components/MediaUploader';

export default function UploadPage() {
  return (
    <div className="min-h-screen pt-20 px-8">
      <Navbar />
      <h2 className="text-3xl font-bold mb-6">Upload Media</h2>

      <MediaUploader />
    </div>
  );
}
