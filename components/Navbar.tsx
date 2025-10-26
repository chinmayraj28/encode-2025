'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="relative border-b border-gray-800/30 backdrop-blur-sm bg-transparent sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold text-white group-hover:text-gray-300 transition-colors">
                Media Mercatum
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  isActive('/')
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                href="/marketplace"
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  isActive('/marketplace')
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Marketplace
              </Link>
              <Link
                href="/upload"
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  isActive('/upload')
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Upload
              </Link>
            </nav>
          </div>

          {/* Right Side: Logo and Connect Wallet Button */}
          <div className="flex items-center gap-4">
            <Image 
              src="/assets/Logo.png" 
              alt="Media Mercatum Logo" 
              width={50} 
              height={50}
              className="rounded-lg"
            />
            <ConnectWallet />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-2 mt-4 pb-2 overflow-x-auto">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
              isActive('/')
                ? 'text-white bg-white/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            href="/marketplace"
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
              isActive('/marketplace')
                ? 'text-white bg-white/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Marketplace
          </Link>
          <Link
            href="/upload"
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
              isActive('/upload')
                ? 'text-white bg-white/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upload
          </Link>
        </nav>
      </div>
    </header>
  );
}
