'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import UploadForm from '@/components/UploadForm';
import AssetGallery from '@/components/AssetGallery';
import { useState } from 'react';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMintSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-sm bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                🎨 Artist Blockchain Platform
              </h1>
              <p className="text-gray-400 text-sm mt-1">Upload, Own, Monetize Your Creative Assets</p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            Your Art, Your Rights, Forever
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upload audio, visuals, VFX/SFX to the blockchain. Get automatic royalties, 
            prove ownership, and collaborate seamlessly.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <FeatureCard 
            icon="🔐"
            title="True Ownership"
            description="Cryptographically signed uploads with permanent proof of authorship"
          />
          <FeatureCard 
            icon="💰"
            title="Auto Royalties"
            description="Smart contracts automatically distribute revenue - no middlemen"
          />
          <FeatureCard 
            icon="🤝"
            title="Collaboration"
            description="Split ownership and revenue with collaborators transparently"
          />
        </div>

        {/* Upload Section */}
        <div className="mb-16">
          <UploadForm onMintSuccess={handleMintSuccess} />
        </div>

        {/* Gallery Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center">📚 Asset Gallery</h2>
          <AssetGallery key={refreshKey} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400">
          <p>Built on Arbitrum Testnet • Stored on IPFS via Pinata</p>
          <p className="text-sm mt-2">Empowering artists with blockchain technology</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
