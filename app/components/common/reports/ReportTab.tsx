const tabs = ["All Reports", "Published", "Approved", "Under Review", "Drafts"];

export function ReportTabs() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          className={`w-full px-4 py-2 text-sm rounded-md shadow text-center transition-colors ${
            idx === 0
              ? "bg-teal-600 text-white border border-teal-600"
              : "bg-white text-gray-800 border border-teal-600"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
