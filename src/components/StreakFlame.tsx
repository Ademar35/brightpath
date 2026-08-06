"use client";

import { motion } from "framer-motion";

export default function StreakFlame({ streak }: { streak: number }) {
  const hot = streak >= 3;
  return (
    <motion.div
      className="flex items-center gap-1 text-orange-500 font-bold text-sm"
      animate={hot ? { scale: [1, 1.15, 1] } : {}}
      transition={hot ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : {}}
    >
      <motion.span
        animate={hot ? { rotate: [-4, 4, -4] } : {}}
        transition={hot ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : {}}
        className="text-base"
      >
        🔥
      </motion.span>
      {streak}
    </motion.div>
  );
}
