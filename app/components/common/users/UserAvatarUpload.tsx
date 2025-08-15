"use client";

import { useState } from "react";
import Image from "next/image";
import PhotoUploadButton from "@/app/components/common/users/PhotoUploadButton";

export default function UserAvatarUpload() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  return (
    <div className="relative w-[64px] h-[64px]">
      <Image
        src={uploadedImage || "/images/image.png"}
        alt="User Avatar"
        width={64}
        height={64}
        className="rounded-full object-cover w-full h-full"
      />

      <PhotoUploadButton
        onUpload={(file) => {
          const imageURL = URL.createObjectURL(file);
          setUploadedImage(imageURL);
        }}
      />
    </div>
  );
}
