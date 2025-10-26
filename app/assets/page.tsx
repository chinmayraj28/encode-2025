'use client';

import Navbar from '@/components/Navbar';

export default function AssetsPage() {
  return (
    <div className="min-h-screen pt-20 px-8">
      <Navbar />
      <h2 className="text-3xl font-bold mb-6">Your Assets</h2>

      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Your Purchases</h3>
        <div className="grid-3">
          {/* Example purchased asset */}
          <div className="asset-card">
            <div className="w-full h-48 bg-gray-700 rounded-lg mb-2"></div>
            <p className="font-medium">Purchased NFT #1</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-4">Your Uploads</h3>
        <div className="grid-3">
          {/* Example uploaded asset */}
          <div className="asset-card">
            <div className="w-full h-48 bg-gray-700 rounded-lg mb-2"></div>
            <p className="font-medium">Uploaded NFT #1</p>
          </div>
        </div>
      </section>
    </div>
  );
}
