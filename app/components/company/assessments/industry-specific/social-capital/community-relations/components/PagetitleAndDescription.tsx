export function PagetitleAndDescription({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-6">
      <h1 className="text-lg">{title}</h1>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}