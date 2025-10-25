'use client';

import { useState } from 'react';
import ChallengeCard from './components/challenges/ChallengeCard';

const tracks = [
	{
		id: 'openfort',
		title: 'Open Fort Build',
		subtitle: 'Consumer app that makes crypto disappear: embedded wallet auth, smooth onboarding.',
		examples: [
			'Embedded wallet onboarding demo',
			'Consumer-facing app flow',
			'Mobile-first creative sharing',
		],
	},
	{
		id: 'livepeer',
		title: 'Livepeer Video',
		subtitle: 'Real-time AI video transformation with Daydream and Livepeer.',
		examples: [
			'Live stream stylizer',
			'Generative visual effects',
			'Voice-reactive visuals',
		],
	},
	{
		id: 'hakflow',
		title: 'Secure Smart Contracts',
		subtitle: 'Security-first development with Hakflow integration.',
		examples: [
			'Smart contract security demo',
			'Automated security checks',
			'Public repo template',
		],
	},
];

export default function ChallengesOverview() {
	const [active, setActive] = useState(tracks[0].id);

	return (
		<section className="bg-slate-900/40 rounded-2xl p-6 shadow-md">
			<header className="mb-6">
				<h2 className="text-2xl text-slate-100 font-semibold">Encode Hackathon Challenges</h2>
				<p className="text-sm text-slate-400">Select a track to explore requirements and examples.</p>
			</header>

			<div className="flex gap-3 overflow-x-auto pb-4">
				{tracks.map((t) => (
					<button
						key={t.id}
						onClick={() => setActive(t.id)}
						className={`rounded-2xl px-4 py-2 text-sm whitespace-nowrap ${
							active === t.id ? 'bg-violet-600 text-white shadow' : 'bg-slate-800/40 text-slate-200'
						}`}
					>
						{t.title}
					</button>
				))}
			</div>

			<div className="mt-6 grid gap-6">
				{tracks
					.filter((t) => t.id === active)
					.map((t) => (
						<div key={t.id} className="space-y-4">
							<div className="bg-slate-800/30 rounded-2xl p-4">
								<h3 className="text-xl text-slate-100 font-semibold mb-2">{t.title}</h3>
								<p className="text-sm text-slate-300">{t.subtitle}</p>
							</div>

							<div className="grid gap-4">
								{t.examples.map((ex) => (
									<ChallengeCard
										key={ex}
										title={ex}
										subtitle="Click for demo details"
										tags={['Demo']}
									/>
								))}
							</div>
						</div>
					))}
			</div>
		</section>
	);
}