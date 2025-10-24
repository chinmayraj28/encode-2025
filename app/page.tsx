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
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Upload encrypted audio, visuals, and VFX/SFX to IPFS. Set your own prices, 
            collaborate with others, and receive instant payments on the blockchain.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <span className="bg-gray-800/50 px-4 py-2 rounded-full">🔒 AES-256 Encryption</span>
            <span className="bg-gray-800/50 px-4 py-2 rounded-full">🌐 IPFS Storage</span>
            <span className="bg-gray-800/50 px-4 py-2 rounded-full">⚡ Smart Contracts</span>
            <span className="bg-gray-800/50 px-4 py-2 rounded-full">🚫 No Platform Fees</span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <FeatureCard 
            icon="🔐"
            title="True Ownership"
            description="Cryptographically signed uploads with permanent proof of authorship on the blockchain"
          />
          <FeatureCard 
            icon="💰"
            title="Creator Pricing"
            description="Set your own price - full payment goes directly to you or is split among collaborators"
          />
          <FeatureCard 
            icon="🤝"
            title="Collaboration"
            description="Add collaborators with custom revenue splits - payments distributed automatically on-chain"
          />
          <FeatureCard 
            icon="🔒"
            title="Encrypted Storage"
            description="Files encrypted with AES-256 before IPFS upload - only buyers get the decryption key"
          />
          <FeatureCard 
            icon="👁️"
            title="Protected Previews"
            description="Heavily watermarked previews (images: 9 watermarks, audio: beeps every 2s) - full quality after purchase"
          />
          <FeatureCard 
            icon="⚡"
            title="Instant Access"
            description="Buyers receive decryption key instantly via blockchain event - permanent on-chain access"
          />
        </div>

        {/* How It Works Section */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-bold mb-6 text-center">💡 How Revenue Sharing Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solo Creator */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h4 className="text-xl font-bold mb-4 text-purple-400">🎨 Solo Creator</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <p><strong>You keep 100%</strong> of the sale price</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <p>Payment sent <strong>instantly</strong> to your wallet</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <p><strong>No platform fees</strong> - all revenue is yours</p>
                </div>
              </div>
              <div className="mt-4 bg-purple-900/30 border border-purple-700 rounded p-3">
                <p className="text-xs text-gray-300">
                  <strong>Example:</strong> You upload a beat for 0.5 ETH<br/>
                  Buyer pays → You receive <span className="text-green-400 font-bold">0.5 ETH</span>
                </p>
              </div>
            </div>

            {/* With Collaborators */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h4 className="text-xl font-bold mb-4 text-pink-400">🤝 With Collaborators</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <p><strong>Split revenue</strong> based on custom percentages</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <p>Smart contract <strong>automatically distributes</strong> to all wallets</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <p><strong>Transparent & immutable</strong> - no disputes</p>
                </div>
              </div>
              <div className="mt-4 bg-pink-900/30 border border-pink-700 rounded p-3">
                <p className="text-xs text-gray-300">
                  <strong>Example:</strong> You + 2 collaborators (40%, 30%, 30%)<br/>
                  Buyer pays 1 ETH → You get <span className="text-green-400 font-bold">0.4 ETH</span><br/>
                  Collab A gets <span className="text-green-400 font-bold">0.3 ETH</span>, Collab B gets <span className="text-green-400 font-bold">0.3 ETH</span>
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Distribution Details */}
          <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-6">
            <h5 className="text-lg font-bold mb-3 text-blue-400">⚙️ How Distribution Works</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-blue-300 mb-2">1. Purchase</p>
                <p className="text-gray-400">Buyer pays the full price you set to the smart contract</p>
              </div>
              <div>
                <p className="font-semibold text-blue-300 mb-2">2. Split Calculation</p>
                <p className="text-gray-400">Contract calculates each collaborator's share based on percentages</p>
              </div>
              <div>
                <p className="font-semibold text-blue-300 mb-2">3. Instant Payout</p>
                <p className="text-gray-400">All collaborators receive payment in same transaction</p>
              </div>
            </div>
          </div>
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
