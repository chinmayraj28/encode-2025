'use client';

import { Button } from '../ui/Button';

type ChallengeCardProps = {
  title: string;
  subtitle: string;
  tags?: string[];
  onPrimary?: () => void;
  onSecondary?: () => void;
};

export default function ChallengeCard({
  title,
  subtitle,
  tags = [],
  onPrimary,
  onSecondary,
}: ChallengeCardProps) {
  return (
    <article className="bg-slate-800/30 rounded-xl p-4 hover:bg-slate-800/40 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg text-slate-100 font-medium">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {onPrimary && (
            <Button onClick={onPrimary} variant="primary">
              Try Now
            </Button>
          )}
          {onSecondary && (
            <Button onClick={onSecondary} variant="secondary">
              Details
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}