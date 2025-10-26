'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UploadForm from '@/components/UploadForm';
import { useAccount } from 'wagmi';

export default function UploadPage() {
  const { isConnected } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMintSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 relative overflow-hidden">
      {/* Fading grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-teal-900/20 to-teal-500/30 pointer-events-none"></div>

      {/* Header */}
      <Navbar />

      {/* Upload Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-300 text-sm font-medium backdrop-blur-sm">
              📤 Create & Monetize
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">
              Upload Your Creative Assets
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            List your audio, visuals, VFX, or 3D models on the blockchain. Set your price, add collaborators, and start earning.
          </p>
        </div>

        {/* Info Cards */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <InfoCard 
              icon="🔒"
              title="Encrypted Storage"
              description="Files encrypted with AES-256 before IPFS upload. Only buyers get the key."
            />
            <InfoCard 
              icon="👁️"
              title="Protected Previews"
              description="Watermarked previews for browsing. Full quality after purchase."
            />
            <InfoCard 
              icon="⚡"
              title="Instant Payment"
              description="Payment sent directly to your wallet on purchase. No delays."
            />
          </div>
        )}

        {/* Upload Form */}
        <div className="mb-20">
          <UploadForm key={refreshKey} onMintSuccess={handleMintSuccess} />
        </div>

        {/* How It Works */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-10 shadow-2xl mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-white">
              📋 How It Works
            </h2>
            <p className="text-gray-400">Simple, secure, and transparent process</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ProcessStep 
              number="1" 
              title="Upload File" 
              description="Choose your audio, visual, VFX, or 3D asset"
              icon="📁"
            />
            <ProcessStep 
              number="2" 
              title="Set Details" 
              description="Add title, description, price, and collaborators"
              icon="✏️"
            />
            <ProcessStep 
              number="3" 
              title="Encrypt & Mint" 
              description="File is encrypted, uploaded to IPFS, and minted as NFT"
              icon="🔐"
            />
            <ProcessStep 
              number="4" 
              title="Start Earning" 
              description="Asset listed on marketplace. Earn on every purchase!"
              icon="💰"
            />
          </div>
        </div>

        {/* Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TipCard 
            icon="💡"
            title="Pricing Tips"
            tips={[
              "Research similar assets for competitive pricing",
              "Consider the quality and uniqueness of your work",
              "Start with lower prices to build reputation",
              "Update prices based on demand"
            ]}
          />
          <TipCard 
            icon="🤝"
            title="Collaboration Tips"
            tips={[
              "Add wallets of all collaborators before minting",
              "Ensure percentages total ≤100% (you keep remainder)",
              "Payments split automatically on each sale",
              "All splits recorded permanently on blockchain"
            ]}
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

function InfoCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 text-center hover:bg-gray-800/50 hover:border-gray-600/50 transition-all">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function ProcessStep({ number, title, description, icon }: { number: string; title: string; description: string; icon: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-teal-500/20">
        {icon}
      </div>
      <div className="text-xs font-bold text-teal-400 mb-2">STEP {number}</div>
      <p className="font-semibold text-white mb-2">{title}</p>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function TipCard({ icon, title, tips }: { icon: string; title: string; tips: string[] }) {
  return (
    <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-8 backdrop-blur-sm hover:border-gray-600/50 transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">{icon}</div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
      </div>
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
            <span className="text-teal-400 mt-0.5">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
