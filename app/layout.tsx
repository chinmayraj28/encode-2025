import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'Artist Blockchain Platform',
  description: 'Create, share, and earn from digital assets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-slate-900">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}