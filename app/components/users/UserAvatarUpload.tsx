import { useState } from "react";
import PhotoUploadButton from "@/app/components/users/PhotoUploadButton";
import Image from "next/image";

export default function UserAvatarUpload({ user }: { user: any }) {
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
