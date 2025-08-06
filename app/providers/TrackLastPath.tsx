// "use client";

// import { usePathname } from "next/navigation";
// import { useEffect } from "react";
// import { useAuth } from "@/context/AuthContext";

// export default function TrackLastPath() {
//   const pathname = usePathname();
//   const { user, setLastVisitedPath } = useAuth();

//   useEffect(() => {
//     if (user && pathname !== "/login") {
//       setLastVisitedPath(pathname);
//     }
//   }, [pathname, user, setLastVisitedPath]);

//   return null;
// }
