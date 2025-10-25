import AssetCard from '../../components/AssetCard';

const allMedia = [
  { id: 1, title: 'NFT 1', image: '/placeholder.png' },
  { id: 2, title: 'NFT 2', image: '/placeholder.png' },
  { id: 3, title: 'NFT 3', image: '/placeholder.png' },
];

export default function GalleryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gallery</h1>
      <div className="grid grid-cols-3 gap-4">
        {allMedia.map(asset => <AssetCard key={asset.id} {...asset} />)}
      </div>
    </div>
  );
}
