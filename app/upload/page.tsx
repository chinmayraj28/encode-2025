import dynamic from 'next/dynamic';
const UploadForm = dynamic(() => import('../../components/upload/UploadForm'), { ssr: false });

export default function UploadPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">Upload Asset</h1>
      <p className="text-slate-400 mb-6">Share your work with the world</p>
      <UploadForm />
    </div>
  );
}