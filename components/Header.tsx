'use client';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Header() {
  const { address } = useAccount();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/80 to-transparent backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
            AB
          </div>
          <div className="hidden sm:block">
            <div className="text-slate-100 font-semibold">Artist Blockchain</div>
            <div className="text-xs text-slate-400">Create • Share • Earn</div>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link 
            href="/upload" 
            className="px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/40"
          >
            Upload
          </Link>
          <Link 
            href="/gallery" 
            className="px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/40"
          >
            Gallery
          </Link>
          <Link 
            href="/challenges" 
            className="px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/40"
          >
            Challenges
          </Link>

          <div className="flex items-center gap-3">
            <ConnectButton showBalance={false} />
            {address && (
              <div className="hidden sm:block text-xs text-slate-400 px-3 py-2 rounded-md bg-slate-800/40">
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}