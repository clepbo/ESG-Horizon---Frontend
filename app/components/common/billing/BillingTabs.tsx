const tabs = ["All Plans", "Free", "Basic", "Premium", "Enterprise"];

export function BillingTabs() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          className={`w-full px-4 py-2 text-sm rounded-md shadow text-center transition-colors ${
            idx === 0
              ? "bg-green-600 text-white border border-green-600"
              : "bg-white text-gray-800 border border-green-600"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
