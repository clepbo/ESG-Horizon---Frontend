"use client";

import Image from "next/image";
import { useState } from "react";

type AvatarProps = {
  src: string;
  alt: string;
  size?: number; // Optional, defaults to 40
};

export default function UserAvatar({ src, alt, size = 30 }: AvatarProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover border border-gray-200"
      onError={() => setImgSrc("/image.png")}
    />
  );
}
