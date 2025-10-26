'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndexedAssetsGallery from '@/components/IndexedAssetsGallery';
import { useAccount } from 'wagmi';

type ViewMode = 'all' | 'purchases';
type MediaFilter = 'all' | 'audio' | 'visual' | 'vfx' | 'sfx' | '3d';

export default function MarketplacePage() {
  const { isConnected } = useAccount();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 relative overflow-hidden">
      {/* Fading grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-teal-900/20 to-teal-500/30 pointer-events-none"></div>

      {/* Header */}
      <Navbar />

      {/* Marketplace Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-300 text-sm font-medium backdrop-blur-sm">
              🛒 Browse Assets
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">
              Discover Amazing Creative Assets
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Browse and purchase high-quality audio, visuals, VFX, and 3D models directly from creators
          </p>

          {/* View Mode Tabs */}
          {isConnected && (
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setViewMode('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  viewMode === 'all'
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                }`}
              >
                🌐 All Assets
              </button>
              <button
                onClick={() => setViewMode('purchases')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  viewMode === 'purchases'
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                }`}
              >
                🛒 Your Purchases
              </button>
            </div>
          )}

          {/* Media Type Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <FilterButton 
              active={mediaFilter === 'all'}
              onClick={() => setMediaFilter('all')}
              icon="📁"
              label="All Media"
            />
            <FilterButton 
              active={mediaFilter === 'audio'}
              onClick={() => setMediaFilter('audio')}
              icon="🎵"
              label="Audio"
            />
            <FilterButton 
              active={mediaFilter === 'visual'}
              onClick={() => setMediaFilter('visual')}
              icon="🎨"
              label="Visual"
            />
            <FilterButton 
              active={mediaFilter === 'vfx'}
              onClick={() => setMediaFilter('vfx')}
              icon="✨"
              label="VFX"
            />
            <FilterButton 
              active={mediaFilter === 'sfx'}
              onClick={() => setMediaFilter('sfx')}
              icon="🔊"
              label="SFX"
            />
            <FilterButton 
              active={mediaFilter === '3d'}
              onClick={() => setMediaFilter('3d')}
              icon="🧊"
              label="3D Models"
            />
          </div>
        </div>

        {/* Marketplace Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <FeatureCard 
            icon="⚡"
            title="Lightning Fast"
            description="Powered by Envio indexer"
          />
          <FeatureCard 
            icon="🔒"
            title="Verified"
            description="All assets blockchain-certified"
          />
          <FeatureCard 
            icon="💎"
            title="Direct Purchase"
            description="Buy directly from creators"
          />
          <FeatureCard 
            icon="🔓"
            title="Instant Access"
            description="Get decryption key instantly"
          />
        </div>

        {/* Gallery */}
        <div className="mb-20">
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-8 shadow-2xl">
            <IndexedAssetsGallery viewMode={viewMode} mediaFilter={mediaFilter} />
          </div>
        </div>

        {/* How Purchasing Works */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-10 shadow-2xl mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-white">
              💡 How Purchasing Works
            </h2>
            <p className="text-gray-400">Simple, transparent, and instant</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <PurchaseStep 
              number="1" 
              title="Browse" 
              description="Filter and find the perfect asset for your project"
              icon="🔍"
            />
            <PurchaseStep 
              number="2" 
              title="Purchase" 
              description="Pay with your wallet - full amount goes to creator(s)"
              icon="💰"
            />
            <PurchaseStep 
              number="3" 
              title="Receive Key" 
              description="Decryption key sent instantly via blockchain event"
              icon="🔑"
            />
            <PurchaseStep 
              number="4" 
              title="Download" 
              description="Access full quality file from IPFS with your key"
              icon="📥"
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BenefitCard 
            icon="🎨"
            title="For Creators"
            benefits={[
              "Keep 100% of revenue",
              "Instant payment on sale",
              "Permanent asset listing",
              "No platform fees"
            ]}
          />
          <BenefitCard 
            icon="🛒"
            title="For Buyers"
            benefits={[
              "High quality assets",
              "Instant access",
              "Blockchain verified",
              "Direct from creator"
            ]}
          />
          <BenefitCard 
            icon="🌐"
            title="For Everyone"
            benefits={[
              "Decentralized storage",
              "Transparent pricing",
              "Smart contract security",
              "No intermediaries"
            ]}
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

function FilterButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
        active
          ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-gray-700/30'
      }`}
    >
      <span>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 text-center hover:bg-gray-800/50 hover:border-gray-600/50 transition-all">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function PurchaseStep({ number, title, description, icon }: { number: string; title: string; description: string; icon: string }) {
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

function BenefitCard({ icon, title, benefits }: { icon: string; title: string; benefits: string[] }) {
  return (
    <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-8 backdrop-blur-sm hover:border-gray-600/50 transition-all">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-6 text-white">{title}</h3>
      <ul className="space-y-3">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
            <span className="text-green-400 mt-0.5">✓</span>
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}
