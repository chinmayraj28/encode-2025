'use client';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Toast } from '../ui/Toast';
import { useAccount } from 'wagmi';

export default function UploadForm() {
  const { address } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [royalty, setRoyalty] = useState(7);
  const [collab, setCollab] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setRoyalty(7);
    setCollab('');
  };

  const handleMint = async () => {
    if (!file || !title) {
      setToast('Please provide a file and title');
      return;
    }

    setToast(null);
    setLoading(true);
    try {
      setToast('Uploading to IPFS...');
      const url = await simulateUploadToIPFS(file);
      setToast('Minting your asset...');
      const asset = await simulateMintAsset({
        fileUrl: url,
        title,
        description,
        royalty,
        collaborators: collab ? collab.split(',').map(s => s.trim()) : [],
        creator: address ?? '0xGuest'
      });
      setToast(`Success! Minted "${asset.title}"`);
      reset();
    } catch (err) {
      setToast('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto bg-slate-900/50 rounded-2xl p-6 shadow-md">
      <h2 className="text-2xl text-slate-100 font-semibold mb-2">Upload Asset</h2>
      <p className="text-sm text-slate-400 mb-6">Share your creative work securely on IPFS and mint as an NFT.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-slate-200">File</span>
          <input
            type="file"
            accept="audio/*,image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-800 file:text-slate-100"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-200">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl bg-slate-800 px-3 py-2 text-slate-100"
            placeholder="Name your piece"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-200">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl bg-slate-800 px-3 py-2 text-slate-100"
            placeholder="Describe your work"
            rows={3}
          />
        </label>

        <div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-200">Royalty: {royalty}%</span>
            <span className="text-xs text-slate-400">Suggested: 5-10%</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={royalty}
            onChange={(e) => setRoyalty(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </div>

        <label className="block">
          <span className="text-sm text-slate-200">Collaborators (optional)</span>
          <input
            value={collab}
            onChange={(e) => setCollab(e.target.value)}
            className="mt-1 w-full rounded-xl bg-slate-800 px-3 py-2 text-slate-100"
            placeholder="Comma-separated wallet addresses"
          />
        </label>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleMint} disabled={loading}>
            {loading ? <Spinner size={4} /> : null}
            {loading ? 'Processing...' : 'Mint Asset'}
          </Button>
          <Button variant="secondary" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}

export async function simulateUploadToIPFS(file: File): Promise<string> {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `ipfs://${Math.random().toString(36).substring(2)}`;
}

export async function simulateMintAsset(asset: {
  fileUrl: string;
  title: string;
  description: string;
  royalty: number;
  collaborators: string[];
  creator: string;
}) {
  // Simulate minting delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { ...asset, tokenId: Math.floor(Math.random() * 1000000) };
}