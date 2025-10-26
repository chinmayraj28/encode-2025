import AssetCard from '../../components/AssetCard';

const uploads = [
  { id: 1, title: 'My NFT 1', image: '/placeholder.png' },
  { id: 2, title: 'My NFT 2', image: '/placeholder.png' },
];

const purchases = [
  { id: 1, title: 'Purchased NFT 1', image: '/placeholder.png' },
];

export default function AssetsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Uploads</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {uploads.map(asset => <AssetCard key={asset.id} {...asset} />)}
      </div>

      <h1 className="text-2xl font-bold mb-4">Your Purchases</h1>
      <div className="grid grid-cols-3 gap-4">
        {purchases.map(asset => <AssetCard key={asset.id} {...asset} />)}
      </div>
    </div>
  );
}
