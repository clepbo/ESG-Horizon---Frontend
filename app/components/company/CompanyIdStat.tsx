// import Image from "next/image";

// type CompanyIdStatProps = {
//   label: string;
//   value: string | number;
//   icon?: React.ReactNode; // optional for cases where we use iconSrc instead
//   iconSrc?: string; // optional image source
//   iconBgColor?: string;
// };

// export function CompanyIdStat({
//   label,
//   value,
//   icon,
//   iconSrc,
//   iconBgColor = "bg-gray-100",
// }: CompanyIdStatProps) {
//   return (
//     <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
//       {/* Left side */}
//       <div>
//         <div className="text-3xl font-semibold text-gray-900">{value}</div>
//         <div className="mt-3 text-sm text-gray-500">{label}</div>
//       </div>

//       {/* Icon / Image */}
//       <div
//         className={`flex h-10 w-10 items-center justify-center rounded-md ${iconBgColor}`}
//       >
//         {iconSrc ? (
//           <Image
//             src={iconSrc}
//             alt={`${label} icon`}
//             width={25}
//             height={25}
//             className="object-contain"
//           />
//         ) : (
//           icon
//         )}
//       </div>
//     </div>
//   );
// }
import Image from "next/image";

type CompanyIdStatProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconSrc?: string;
  iconBgColor?: string;
};

export function CompanyIdStat({
  label,
  value,
  icon,
  iconSrc,
  iconBgColor = "bg-gray-100",
}: CompanyIdStatProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Left side */}
      <div>
        <div className="text-3xl font-semibold text-gray-900">{value}</div>
        <div className="mt-3 text-sm text-gray-500">{label}</div>
      </div>

      {/* Icon / Image */}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-md ${iconBgColor}`}
      >
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={`${label} icon`}
            width={25}
            height={25}
            className="object-contain"
          />
        ) : (
          icon
        )}
      </div>
    </div>
  );
}
