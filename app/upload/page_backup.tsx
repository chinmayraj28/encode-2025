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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <Navbar />

      {/* Upload Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium backdrop-blur-sm">
              📤 Create & Monetize
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Upload Your Creative Assets
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            List your audio, visuals, VFX, SFX, or 3D models on the blockchain. Set your price, add collaborators, and start earning with zero platform fees.
          </p>
        </div>

        {/* Info Cards */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <InfoCard 
              icon="🔒"
              title="Automatic Encryption"
              description="Your file is encrypted with AES-256 before upload to IPFS"
            />
            <InfoCard 
              icon="👁️"
              title="Preview Generated"
              description="Watermarked preview created automatically for public browsing"
            />
            <InfoCard 
              icon="⚡"
              title="Instant Payment"
              description="Receive ETH immediately when someone purchases your asset"
            />
          </div>
        )}

        {/* Upload Form */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <UploadForm onMintSuccess={handleMintSuccess} key={refreshKey} />
          </div>
        </div>

        {/* How Upload Works */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-10 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              🔄 How It Works
            </h2>
            <p className="text-gray-400">Your journey from upload to earning</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <UploadStep 
              number="1"
              title="Prepare File"
              description="Select your creative asset and add title, description, and price"
              icon="📁"
            />
            <UploadStep 
              number="2"
              title="Encryption"
              description="File is automatically encrypted with AES-256 and uploaded to IPFS"
              icon="🔐"
            />
            <UploadStep 
              number="3"
              title="Mint NFT"
              description="Smart contract mints an NFT with your asset details on blockchain"
              icon="⛓️"
            />
            <UploadStep 
              number="4"
              title="Start Earning"
              description="Your asset is live! Buyers can purchase and you receive instant payment"
              icon="💰"
            />
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <TipCard 
            icon="💡"
            title="Pricing Tips"
            tips={[
              "Research similar assets to set competitive prices",
              "Consider file quality and uniqueness",
              "Start lower to build reputation, increase later",
              "Remember: 100% of the sale goes to you/collaborators"
            ]}
          />
          <TipCard 
            icon="🤝"
            title="Collaboration Best Practices"
            tips={[
              "Clearly communicate revenue splits upfront",
              "Use verified wallet addresses only",
              "Document agreements off-chain for reference",
              "Payment splits are automatic and immutable"
            ]}
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}

function InfoCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/40 transition-all">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold mb-2 text-purple-300">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function UploadStep({ number, title, description, icon }: { number: string; title: string; description: string; icon: string }) {
  return (
    <div className="text-center group">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all group-hover:scale-110">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
          {number}
        </div>
      </div>
      <h3 className="font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function TipCard({ icon, title, tips }: { icon: string; title: string; tips: string[] }) {
  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
              <span className="text-purple-400 text-sm">✓</span>
            </div>
            <p className="text-sm text-gray-300">{tip}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
