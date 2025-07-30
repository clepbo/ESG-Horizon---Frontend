"use client";

export default function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-[140px] text-sm px-2 py-1 rounded-md border border-gray-300"
    >
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  );
}
