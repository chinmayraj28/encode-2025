import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
};

export function Button({ children, className = '', variant = 'primary', ...rest }: Props) {
  const base = 'rounded-2xl px-4 py-2 font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm';
  const styles = variant === 'primary'
    ? 'bg-violet-500 hover:bg-violet-600 text-white shadow-violet-400/20 focus:ring-violet-400'
    : 'bg-transparent border border-slate-700 text-slate-100 hover:bg-slate-800 focus:ring-slate-400';
  
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}