"use client";

export default function RoleDefinitions() {
  const roles = [
    {
      title: "Super Admin",
      color: "green",
      permissions: [
        "Full control of the entire SaaS platform",
        {
          label: "Can manage:",
          items: ["Companies", "Metrics", "Benchmarks", "All users"],
        },
      ],
    },
    {
      title: "Platform Admin",
      color: "yellow",
      permissions: [
        {
          label: "Can manage:",
          items: ["Companies", "Super Admin sub-users"],
        },
        {
          label: "Cannot:",
          items: [
            "Delete the Super Admin account",
            "Modify the Super Admin account",
          ],
        },
        "Can approve ESG companies",
      ],
    },
    {
      title: "Platform Manager/Validator",
      color: "blue",
      permissions: [
        "Can view ESG benchmarks and metrics",
        "Can edit ESG benchmarks and metrics",
        "Can validate ESG benchmarks and metrics",
        {
          label: "Can edit:",
          items: ["Quantitative requirements", "Qualitative requirements"],
        },
      ],
    },
    {
      title: "Platform Viewer",
      color: "red",
      permissions: [
        {
          label: "Can view:",
          items: ["All companies", "All metrics", "All data", "All reports"],
        },
        "Cannot edit any content",
      ],
    },
  ];

  return (
    <section className="mt-6 bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-1">Role Definitions</h3>
      <p className="text-gray-600 mb-6">
        Understanding user permissions and access levels
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div
            key={role.title}
            className="border border-gray-200 rounded-lg p-5 bg-white"
          >
            {/* Role Title Pill */}
            <div
              className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-${role.color}-500`}
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
