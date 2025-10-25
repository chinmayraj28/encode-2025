import AssetCard from '../../components/AssetCard';

const topCreators = [
  { id: 1, title: 'Creator 1', image: '/placeholder.png' },
  { id: 2, title: 'Creator 2', image: '/placeholder.png' },
  { id: 3, title: 'Creator 3', image: '/placeholder.png' },
];

export default function ExplorePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Top Creators</h1>
      <div className="grid grid-cols-3 gap-4">
        {topCreators.map(creator => <AssetCard key={creator.id} {...creator} />)}
      </div>
    </div>
  );
}
