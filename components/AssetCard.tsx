interface AssetCardProps {
  title: string;
  image: string;
}

export default function AssetCard({ title, image }: AssetCardProps) {
  return (
    <div className="border rounded p-2 hover:shadow-lg transition">
      <img src={image} alt={title} className="w-full h-48 object-cover rounded" />
      <h2 className="mt-2 font-semibold">{title}</h2>
    </div>
  );
}
