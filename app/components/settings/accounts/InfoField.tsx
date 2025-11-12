"use client";

interface InfoFieldProps {
  label: string;
  value?: string;
}

export default function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
