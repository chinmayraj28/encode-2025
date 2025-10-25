import dynamic from 'next/dynamic';
const AssetGallery = dynamic(() => import('../../components/gallery/AssetGallery'), { ssr: false });

export default function GalleryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">Asset Gallery</h1>
      <p className="text-slate-400 mb-6">Browse and collect creative assets</p>
      <AssetGallery />
    </div>
  );
}