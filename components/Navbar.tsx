import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">Encode</div>
      <nav className="flex gap-6">
        <Link href="/assets" className="hover:text-gray-300">Assets</Link>
        <Link href="/upload" className="hover:text-gray-300">Upload</Link>
        <Link href="/gallery" className="hover:text-gray-300">Gallery</Link>
        <Link href="/explore" className="hover:text-gray-300">Explore</Link>
      </nav>
    </header>
  );
}
