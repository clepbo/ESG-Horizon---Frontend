"use client";

export default function RoleDefinitions() {
  const roles = [
    {
      title: "ESG Admin",
      color: "bg-teal-500",
      bg: "bg-green-50",
      permissions: [
        "Registers their company",
        { label: "Can manage:", items: ["Departments", "Users"] },
        "Can submit ESG data",
        "Can trigger assessments",
      ],
    },
    {
      title: "ESG Data Manager",
      color: "bg-yellow-500",
      bg: "bg-yellow-50",
      permissions: [
        { label: "Inputs ESG data:", items: ["Quantitative", "Qualitative"] },
        "Has no approval rights",
      ],
    },
    {
      title: "ESG Reviewer/Sub Admin",
      color: "bg-emerald-500",
      bg: "bg-blue-50",
      permissions: [
        "Reviews ESG data",
        "Validates ESG data",
        'Can mark sections as "ready"',
        "Cannot submit final reports",
      ],
    },
    {
      title: "ESG Viewer",
      color: "bg-red-500",
      bg: "bg-red-50",
      permissions: [
        { label: "Can view:", items: ["ESG data", "Dashboards", "Reports"] },
      ],
    },
  ];

  return (
    <section className="mt-6">
      <h3 className="text-2xl font-bold mb-1">Role Definitions</h3>
      <p className="text-gray-600 mb-6">
        Understanding user permissions and access levels
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div
            key={role.title}
            className={`${role.bg} p-5 rounded-lg border border-gray-200`}
          >
            {/* Role Title Pill */}
            <div
              className={`${role.color} inline-block px-3 py-1 rounded-full text-white text-sm font-medium`}
            >
              {role.title}
            </div>

            {/* Permissions List */}
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {role.permissions.map((perm, i) =>
                typeof perm === "string" ? (
                  <li key={i} className="list-disc ml-5">
                    {perm}
                  </li>
                ) : (
                  <li key={i} className="ml-5">
                    <span className="font-medium">{perm.label}</span>
                    <ul className="list-disc ml-5 mt-1 space-y-1">
                      {perm.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
