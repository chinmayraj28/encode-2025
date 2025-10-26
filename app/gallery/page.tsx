'use client';

import Navbar from '@/components/Navbar';

export default function GalleryPage() {
  return (
    <div className="min-h-screen pt-20 px-8">
      <Navbar />
      <h2 className="text-3xl font-bold mb-6">Gallery</h2>

      <div className="grid-3">
        {/* Example gallery item */}
        <div className="card">
          <div className="w-full h-48 bg-gray-700 rounded-lg mb-2"></div>
          <p className="font-medium">Gallery Item 1</p>
        </div>
      </div>
    </div>
  );
}
