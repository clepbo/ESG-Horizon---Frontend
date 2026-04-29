interface SettingsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function SettingsCard({ title, children, className = "" }: SettingsCardProps) {
  return (
    <section className={`bg-white rounded-xl border border-gray-100 p-5 sm:p-6 ${className}`}>
      <h3 className="text-base font-semibold text-gray-900 mb-5">{title}</h3>
      {children}
    </section>
  );
}
