'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-[color:var(--accent)]">Encode</h1>
      </div>
      <div className="flex items-center">
        <Link href="/assets">Assets</Link>
        <Link href="/upload">Upload</Link>
        <Link href="/gallery">Gallery</Link>
        <Link href="/explore">Explore</Link>
      </div>
    </nav>
  );
}
