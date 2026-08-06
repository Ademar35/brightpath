"use client";

import { AnimatePresence, motion } from "framer-motion";

export interface Celebration {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string; // gradient classes
}

export function pointsToLevel(points: number) {
  return Math.floor(points / 100) + 1;
}

export default function CelebrationToast({ celebration, onDone }: { celebration: Celebration | null; onDone: () => void }) {
  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          key={celebration.id}
          initial={{ opacity: 0, y: -40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          onAnimationComplete={() => {
            const t = setTimeout(onDone, 2000);
            return () => clearTimeout(t);
          }}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r ${celebration.color} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[90vw]`}
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6, repeat: 2 }}
            className="text-3xl shrink-0"
          >
            {celebration.emoji}
          </motion.span>
          <div>
            <div className="font-display font-extrabold text-lg leading-tight">{celebration.title}</div>
            <div className="text-xs text-white/90">{celebration.subtitle}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
