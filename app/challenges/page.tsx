'use client';

import dynamic from 'next/dynamic';

const ChallengesOverview = dynamic(
  () => import('../../components/challenges/ChallengesOverview'),
  { loading: () => <div className="animate-pulse bg-slate-800/50 rounded-2xl h-96" /> }
);

export default function ChallengesPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">
        Hackathon Challenges
      </h1>
      <p className="text-slate-400 mb-6">
        Explore challenges and start building
      </p>
            <ChallengesOverview />
        </div>
    )
}

export default ChallengesPage