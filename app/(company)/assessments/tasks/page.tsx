"use client";

import Header from "../../components/Header";
import { motion } from "framer-motion";

export default function TasksPage() {
  return (
    <div className="flex h-screen bg-green-50 overflow-hidden">
      <motion.main
        className="flex-1 h-full overflow-y-auto p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          duration: 0.5,
        }}
      >
        <Header />
        <p>le tasks</p>
      </motion.main>
    </div>
  );
}
