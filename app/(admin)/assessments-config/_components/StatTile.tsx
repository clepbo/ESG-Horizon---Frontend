interface StatTileProps {
  label: string;
  value: string | number;
}

export default function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
      <p className="text-xs text-gray-700">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1.5 leading-none">{value}</p>
    </div>
  );
}
