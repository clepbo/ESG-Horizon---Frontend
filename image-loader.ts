export default function myLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (!src) return ""; // Prevent crashing on empty src

  if (src.includes("cloudinary.com") || src.includes("res.cloudinary.com")) {
    return src.replace('/upload/', `/upload/w_${width},q_${quality || 'auto'}/`);
  }

  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  return `${src}?w=${width}&q=${quality || 75}`;
}
