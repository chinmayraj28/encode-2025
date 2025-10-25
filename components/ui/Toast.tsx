import { useEffect } from 'react';

export function Toast({ message, onClose }: { message: string; onClose?: () => void }) {
  useEffect(() => {
    const id = setTimeout(() => onClose && onClose(), 3500);
    return () => clearTimeout(id);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-6 bottom-6 z-50 rounded-xl bg-slate-800 text-slate-100 px-4 py-3 shadow-lg ring-1 ring-black/10"
    >
      {message}
    </div>
  );
}