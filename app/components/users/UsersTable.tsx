// "use client";

// import { useState } from "react";
// import { useDebounce } from "use-debounce";
// import { useUsers } from "@/hooks/useUsers";

// import SearchInput from "@/app/components/ui/SearchInput";
// import SelectFilter from "@/app/components/ui/SearchFilter";
// import Spinner from "@/app/components/ui/Spinner";
// import UserTable from "@/app/components/users/UserTable";
// import AdminUserTable from "@/app/components/users/AdminUserTable";
// import AddAdminModal from "@/app/components/users/AddAdminModal";

// const PERSONA_DISPLAY = [
//   "All Users",
//   "Admins",
//   "Investor",
//   "ESG Company",
//   "Regulator",
// ];

// const PERSONA_MAP: Record<string, string> = {
//   "All Users": "all",
//   Admins: "admin",
//   Investor: "investor",
//   "ESG Company": "esg company",
//   Regulator: "regulator",
// };

// export default function UsersTable() {
//   const { data: users = [], isLoading, error } = useUsers();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
//   const [statusFilter, setStatusFilter] = useState("All Status");
//   const [personaFilter, setPersonaFilter] = useState("All Users");
//   const [showAddAdminModal, setShowAddAdminModal] = useState(false);

//   const normalizedPersona = PERSONA_MAP[personaFilter];

//   const filteredUsers = users.filter((user) => {
//     const matchesSearch =
//       debouncedSearchTerm === "" ||
//       user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
//       user.company?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

//     const matchesStatus =
//       statusFilter === "All Status" ||
//       user.status?.trim().toLowerCase() === statusFilter.trim().toLowerCase();

//     const matchesPersona =
//       normalizedPersona === "all" ||
//       user.category?.toLowerCase() === normalizedPersona;

//     return matchesSearch && matchesStatus && matchesPersona;
//   });

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-40">
//         <Spinner />
//       </div>
//     );
//   }

//   if (error) {
//     return <p className="text-center text-red-500">Failed to load users.</p>;
//   }

//   return (
//     <section className="mt-6 space-y-4">
//       <div className="flex items-center justify-between">
//         <SelectFilter
//           value={personaFilter}
//           onChange={setPersonaFilter}
//           options={PERSONA_DISPLAY}
//         />

//         {normalizedPersona === "admin" && (
//           <button
//             onClick={() => setShowAddAdminModal(true)}
//             className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors cursor-pointer"
//           >
//             + Add Admin
//           </button>
//         )}
//       </div>

//       <div className="rounded-md border border-black/10 bg-white p-6 shadow">
//         <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//           <SearchInput
//             value={searchTerm}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setSearchTerm(e.target.value)
//             }
//           />
//           <div className="flex gap-2">
//             <SelectFilter
//               value={statusFilter}
//               onChange={setStatusFilter}
//               options={[
//                 "All Status",
//                 "Approved",
//                 "Pending",
//                 "Suspended",
//                 "Under Review",
//               ]}
//             />
//             <SelectFilter
//               value={statusFilter}
//               onChange={setStatusFilter}
//               options={["All Roles", "Admin", "Editor", "Viewer"]}
//             />
//           </div>
//         </div>

//         {normalizedPersona === "admin" ? (
//           <AdminUserTable users={filteredUsers} />
//         ) : (
//           <UserTable users={filteredUsers} />
//         )}
//       </div>

//       {showAddAdminModal && (
//         <AddAdminModal onClose={() => setShowAddAdminModal(false)} />
//       )}
//     </section>
//   );
// }
"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useUsers } from "@/hooks/useUsers";

import SearchInput from "@/app/components/ui/SearchInput";
import SelectFilter from "@/app/components/ui/SearchFilter";
import Spinner from "@/app/components/ui/Spinner";
import UserTable from "@/app/components/users/UserTable";
import AdminUserTable from "@/app/components/users/AdminUserTable";
import AddAdminModal from "@/app/components/users/AddAdminModal";

const PERSONA_DISPLAY = [
  "All Users",
  "Admins",
  "Investor",
  "ESG Company",
  "Regulator",
];

const PERSONA_MAP: Record<string, string> = {
  "All Users": "all",
  Admins: "admin",
  Investor: "investor",
  "ESG Company": "esg company",
  Regulator: "regulator",
};

export default function UsersTable() {
  const { data: users = [], isLoading, error } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const [statusFilter, setStatusFilter] = useState("All Status");
  const [roleFilter, setRoleFilter] = useState("All Roles"); // ✅ new state
  const [personaFilter, setPersonaFilter] = useState("All Users");
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  const normalizedPersona = PERSONA_MAP[personaFilter];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      debouncedSearchTerm === "" ||
      user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.company?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" ||
      user.status?.trim().toLowerCase() === statusFilter.trim().toLowerCase();

    const matchesRole =
      roleFilter === "All Roles" ||
      user.role?.trim().toLowerCase() === roleFilter.trim().toLowerCase();

    const matchesPersona =
      normalizedPersona === "all" ||
      user.category?.toLowerCase() === normalizedPersona;

    return matchesSearch && matchesStatus && matchesRole && matchesPersona;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Failed to load users.</p>;
  }

  return (
    <section className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <SelectFilter
          value={personaFilter}
          onChange={setPersonaFilter}
          options={PERSONA_DISPLAY}
        />

        {normalizedPersona === "admin" && (
          <button
            onClick={() => setShowAddAdminModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors cursor-pointer"
          >
            + Add Admin
          </button>
        )}
      </div>

      <div className="rounded-md border border-black/10 bg-white p-6 shadow">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />

          <div className="flex gap-2">
            <SelectFilter
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                "All Status",
                "Approved",
                "Pending",
                "Suspended",
                "Under Review",
              ]}
            />
            <SelectFilter
              value={roleFilter} // ✅ new role filter
              onChange={setRoleFilter}
              options={["All Roles", "Admin", "Editor", "Viewer"]}
            />
          </div>
        </div>

        {normalizedPersona === "admin" ? (
          <AdminUserTable users={filteredUsers} />
        ) : (
          <UserTable users={filteredUsers} />
        )}
      </div>

      {showAddAdminModal && (
        <AddAdminModal onClose={() => setShowAddAdminModal(false)} />
      )}
    </section>
  );
}
