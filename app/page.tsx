'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 relative overflow-hidden">
      {/* Fading grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-teal-900/20 to-teal-500/30 pointer-events-none"></div>

      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        {/* Centered Hero Content */}
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
              <span className="text-white">
                Unleash the Power
              </span>
              <br />
              <span className="text-white">
                of Web3 Creative Assets
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Accelerate your creative workflow with blockchain technology
              that secures, monetizes, and distributes your digital art.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/upload"
                className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                href="/marketplace"
                className="px-8 py-4 bg-transparent text-white border-2 border-white/30 rounded-full font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>

        {/* Features Preview Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Media Mercatum?</h2>
            <p className="text-gray-400 text-lg">Built for creators, powered by blockchain</p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <StatCard number="2.5K+" label="Assets Listed" />
            <StatCard number="890+" label="Active Creators" />
            <StatCard number="45 ETH" label="Total Volume" />
            <StatCard number="100%" label="Creator Revenue" />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <FeatureCard 
            icon="🔐"
            title="True Ownership"
            description="Cryptographically signed uploads with permanent proof of authorship on the blockchain"
            gradient="from-purple-500/10 to-indigo-500/10"
            borderGradient="from-purple-500 to-indigo-500"
          />
          <FeatureCard 
            icon="💰"
            title="Creator Pricing"
            description="Set your own price - full payment goes directly to you or is split among collaborators"
            gradient="from-pink-500/10 to-rose-500/10"
            borderGradient="from-pink-500 to-rose-500"
          />
          <FeatureCard 
            icon="🤝"
            title="Collaboration"
            description="Add collaborators with custom revenue splits - payments distributed automatically on-chain"
            gradient="from-purple-500/10 to-pink-500/10"
            borderGradient="from-purple-500 to-pink-500"
          />
          <FeatureCard 
            icon="🔒"
            title="Encrypted Storage"
            description="Files encrypted with AES-256 before IPFS upload - only buyers get the decryption key"
            gradient="from-indigo-500/10 to-purple-500/10"
            borderGradient="from-indigo-500 to-purple-500"
          />
          <FeatureCard 
            icon="👁️"
            title="Protected Previews"
            description="Heavily watermarked previews - full quality after purchase"
            gradient="from-violet-500/10 to-purple-500/10"
            borderGradient="from-violet-500 to-purple-500"
          />
          <FeatureCard 
            icon="⚡"
            title="Instant Access"
            description="Buyers receive decryption key instantly via blockchain event - permanent on-chain access"
            gradient="from-fuchsia-500/10 to-pink-500/10"
            borderGradient="from-fuchsia-500 to-pink-500"
          />
          </div>
        </div>

        {/* Revenue Sharing Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-10 mb-20 shadow-2xl">
          <div className="relative">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold mb-3 text-white">
                💡 How Revenue Sharing Works
              </h3>
              <p className="text-gray-400">Transparent, automated, and fair distribution</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Solo Creator */}
              <div className="group relative bg-gray-800/30 rounded-2xl p-8 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
                <h4 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <span className="text-3xl">🎨</span> Solo Creator
                </h4>
                <div className="space-y-4 mb-6">
                  <BenefitItem text="You keep 100% of the sale price" />
                  <BenefitItem text="Payment sent instantly to your wallet" />
                  <BenefitItem text="No platform fees - all revenue is yours" />
                </div>
                <div className="bg-teal-900/20 border border-teal-500/20 rounded-xl p-5 backdrop-blur-sm">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="font-semibold text-teal-300">Example:</span> You upload a beat for 0.5 ETH<br/>
                    <span className="text-gray-400">Buyer pays →</span> You receive <span className="text-green-400 font-bold text-lg">0.5 ETH</span>
                  </p>
                </div>
              </div>

              {/* With Collaborators */}
              <div className="group relative bg-gray-800/30 rounded-2xl p-8 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
                <h4 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <span className="text-3xl">🤝</span> With Collaborators
                </h4>
                <div className="space-y-4 mb-6">
                  <BenefitItem text="Split revenue based on custom percentages" />
                  <BenefitItem text="Smart contract automatically distributes to all wallets" />
                  <BenefitItem text="Transparent & immutable - no disputes" />
                </div>
                <div className="bg-cyan-900/20 border border-cyan-500/20 rounded-xl p-5 backdrop-blur-sm">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="font-semibold text-cyan-300">Example:</span> You + 2 collaborators (40%, 30%, 30%)<br/>
                    <span className="text-gray-400">Buyer pays 1 ETH →</span><br/>
                    You get <span className="text-green-400 font-bold">0.4 ETH</span> • 
                    Collab A gets <span className="text-green-400 font-bold">0.3 ETH</span> • 
                    Collab B gets <span className="text-green-400 font-bold">0.3 ETH</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Distribution Process */}
            <div className="mt-10 bg-blue-900/10 border border-blue-500/20 rounded-2xl p-8">
              <h5 className="text-xl font-bold mb-6 text-blue-300 flex items-center gap-2">
                <span>⚙️</span> Distribution Process
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ProcessStep 
                  number="1" 
                  title="Purchase" 
                  description="Buyer pays the full price you set to the smart contract"
                />
                <ProcessStep 
                  number="2" 
                  title="Split Calculation" 
                  description="Contract calculates each collaborator's share based on percentages"
                />
                <ProcessStep 
                  number="3" 
                  title="Instant Payout" 
                  description="All collaborators receive payment in same transaction"
                />
              </div>
            </div>
          </div>
        </div>

          {/* Call to Action Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload CTA */}
          <Link href="/upload" className="group relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-10 hover:border-gray-600/50 transition-all duration-300 overflow-hidden">
            <div className="relative">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">📤</div>
              <h3 className="text-3xl font-bold mb-4 text-white">
                Upload Your Art
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                List your creative assets on the blockchain. Set your price, add collaborators, and start earning instantly with zero platform fees.
              </p>
              <div className="flex items-center gap-2 text-teal-400 font-semibold group-hover:gap-4 transition-all">
                <span>Start Creating</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Marketplace CTA */}
          <Link href="/marketplace" className="group relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-10 hover:border-gray-600/50 transition-all duration-300 overflow-hidden">
            <div className="relative">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🛒</div>
              <h3 className="text-3xl font-bold mb-4 text-white">
                Browse Marketplace
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Discover amazing audio, visuals, VFX, and 3D assets. Purchase directly from creators with instant access and blockchain-verified ownership.
              </p>
              <div className="flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-4 transition-all">
                <span>Explore Assets</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 bg-gray-800/60 backdrop-blur-sm px-5 py-2.5 rounded-full border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
      <span>{icon}</span>
      <span className="text-sm font-medium text-gray-300">{text}</span>
    </span>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 text-center hover:bg-gray-800/50 transition-all duration-300">
      <p className="text-3xl md:text-4xl font-bold text-white mb-2">
        {number}
      </p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient, 
  borderGradient 
}: { 
  icon: string; 
  title: string; 
  description: string;
  gradient: string;
  borderGradient: string;
}) {
  return (
    <div className="group relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-300">
      <div className="relative">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
        <span className="text-green-400 text-sm">✓</span>
      </div>
      <p className="text-gray-300 text-sm">{text}</p>
    </div>
  );
}

function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-teal-500/20">
        {number}
      </div>
      <p className="font-semibold text-teal-300 mb-2">{title}</p>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}