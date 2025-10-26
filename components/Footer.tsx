'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative border-t border-gray-800/50 mt-32 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-xl">
                🎨
              </div>
              <span className="text-xl font-bold text-white">
                Media Mercatum
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Empowering artists with blockchain technology. Upload, own, and monetize your creative assets with true ownership and instant payments.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/30 hover:border-gray-600/50 rounded-lg flex items-center justify-center transition-all">
                <span className="text-lg">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/30 hover:border-gray-600/50 rounded-lg flex items-center justify-center transition-all">
                <span className="text-lg">💬</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/30 hover:border-gray-600/50 rounded-lg flex items-center justify-center transition-all">
                <span className="text-lg">📧</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-teal-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-teal-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-teal-400 transition-colors">
                  Browse Assets
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-teal-400 transition-colors">
                  Start Creating
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Network</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Built on Sepolia Testnet</li>
              <li>Stored on IPFS via Pinata</li>
              <li>Powered by Envio Indexer</li>
              <li>AES-256 Encryption</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© 2025 Media Mercatum. Decentralized Creative Marketplace.</p>
          <p className="mt-2 text-xs">Smart Contracts • Zero Platform Fees • True Ownership</p>
        </div>
      </div>
    </footer>
  );
}
