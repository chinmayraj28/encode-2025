import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Encode</h1>
      <p className="mb-8">Your platform for uploading and exploring digital assets.</p>
      <Link href="/assets" className="bg-blue-600 text-white px-6 py-3 rounded">Go to Assets</Link>
    </div>
  );
}
