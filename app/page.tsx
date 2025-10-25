'use client';

import dynamic from 'next/dynamic';

const AssetGallery = dynamic(() => import('../components/gallery/AssetGallery'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-800/50 rounded-2xl h-96" />,
});

const ChallengesOverview = dynamic(() => import('../components/challenges/ChallengesOverview'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-800/50 rounded-2xl h-64" />,
});

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-slate-100 mb-6">
        Artist Blockchain Platform
      </h1>
      <div className="space-y-8">
        <AssetGallery />
        <ChallengesOverview />
      </div>
    </main>
  );
}