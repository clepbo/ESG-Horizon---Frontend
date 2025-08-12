// "use client";

// import { useState } from "react";
// import { CircleX } from "lucide-react";
// import Image from "next/image";
// import clsx from "clsx";
// import PhotoUploadButton from "./PhotoUploadButton";
// import BackButton from "../BackButton";

// type User = {
//   name: string;
//   email: string;
//   phone: string;
//   avatar?: string;
//   permission: string;
//   company: string;
//   companyEmail?: string;
//   companyPhone?: string;
//   website?: string;
//   registrationNumber?: string;
//   staffStrength?: string;
//   address?: string;
//   companyLogo?: string;
// };

// export default function EditUserModal({
//   user,
//   onClose,
//   onStatusToggle,
// }: {
//   user: User;
//   onClose: () => void;
//   onStatusToggle: (userId: string, newStatus: string) => void;
// }) {
//   const [firstName, lastName] = user.name.split(" ");
//   const [userImage, setUserImage] = useState<string | null>(null);

//   return (
//     <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
//       <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-5xl">
//         <button
//           onClick={onClose}
//           className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition"
//         >
//           <CircleX size={28} />
//         </button>

//         <BackButton />

//         <h2 className="text-xl font-semibold text-gray-900 mb-6">
//           Personal Information
//         </h2>

//         <div className="flex items-center gap-4 mb-8 relative w-max">
//           <Image
//             src={userImage || user.avatar || "/images/image.png"}
//             alt="User Avatar"
//             width={72}
//             height={72}
//             className="rounded-full object-cover border border-gray-200"
//             unoptimized
//           />
//           <PhotoUploadButton
//             onUpload={(file) => {
//               const imageUrl = URL.createObjectURL(file);
//               setUserImage(imageUrl);
//             }}
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <InputField label="First Name" value={firstName} required />
//           <InputField label="Last Name" value={lastName} required />
//           <InputField label="Email" value={user.email} required />
//           <InputField label="Phone Number" value={user.phone} required />
//           <InputField label="Role" value="Sustainability Officer" required />
//           <InputField label="Permission" value={user.permission} required />
//         </div>

//         <div className="flex justify-end gap-4 mt-10">
//           <button
//             onClick={onClose}
//             className="border border-green-300 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50"
//           >
//             Close
//           </button>
//           <button className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600">
//             Update
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { Info } from "lucide-react";

// function InputField({
//   label,
//   value,
//   required = false,
//   info,
// }: {
//   label: string;
//   value: string;
//   required?: boolean;
//   info?: string;
// }) {
//   return (
//     <div className="flex flex-col">
//       <div className="flex items-center justify-between mb-1">
//         <label className="flex items-center text-sm font-medium text-gray-800 mb-1">
//           <span>{label}</span>
//           {info ? (
//             <div className="group relative ml-1 cursor-pointer">
//               <Info className="w-4 h-4 text-gray-500" />
//               <div className="absolute left-5 top-1 z-10 hidden w-max rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
//                 {info}
//               </div>
//             </div>
//           ) : required ? (
//             <span className="ml-1 text-red-500">*</span>
//           ) : null}
//         </label>
//       </div>

//       <input
//         type="text"
//         defaultValue={value}
//         className={clsx(
//           "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition",
//           "text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-esg-green",
//           "hover:shadow-sm"
//         )}
//       />
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { CircleX, Info } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import PhotoUploadButton from "./PhotoUploadButton";
import BackButton from "../BackButton";

type User = {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  permission: string;
  company: string;
  companyEmail?: string;
  companyPhone?: string;
  website?: string;
  registrationNumber?: string;
  staffStrength?: string;
  address?: string;
  companyLogo?: string;
};

interface EditUserModalProps {
  user: User;
  onClose: () => void;
}

export default function EditUserModal({ user, onClose }: EditUserModalProps) {
  const [firstName, lastName] = user.name.split(" ");
  const [userImage, setUserImage] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-5xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition"
        >
          <CircleX size={28} />
        </button>

        <BackButton />

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Personal Information
        </h2>

        {/* Avatar + Upload */}
        <div className="flex items-center gap-4 mb-8 relative w-max">
          <Image
            src={userImage || user.avatar || "/images/image.png"}
            alt="User Avatar"
            width={72}
            height={72}
            className="rounded-full object-cover border border-gray-200"
            unoptimized
          />
          <PhotoUploadButton
            onUpload={(file) => {
              const imageUrl = URL.createObjectURL(file);
              setUserImage(imageUrl);
            }}
          />
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="First Name" value={firstName} required />
          <InputField label="Last Name" value={lastName} required />
          <InputField label="Email" value={user.email} required />
          <InputField label="Phone Number" value={user.phone} required />
          <InputField label="Role" value="Sustainability Officer" required />
          <InputField label="Permission" value={user.permission} required />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={onClose}
            className="border border-green-300 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50"
          >
            Close
          </button>
          <button className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600">
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  required = false,
  info,
}: {
  label: string;
  value: string;
  required?: boolean;
  info?: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <label className="flex items-center text-sm font-medium text-gray-800 mb-1">
          <span>{label}</span>
          {info ? (
            <div className="group relative ml-1 cursor-pointer">
              <Info className="w-4 h-4 text-gray-500" />
              <div className="absolute left-5 top-1 z-10 hidden w-max rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
                {info}
              </div>
            </div>
          ) : required ? (
            <span className="ml-1 text-red-500">*</span>
          ) : null}
        </label>
      </div>

      <input
        type="text"
        defaultValue={value}
        className={clsx(
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition",
          "text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-esg-green",
          "hover:shadow-sm"
        )}
      />
    </div>
  );
}
