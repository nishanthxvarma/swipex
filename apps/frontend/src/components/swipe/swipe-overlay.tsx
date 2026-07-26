"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface SwipeOverlayProps {
  direction: "left" | "right";
}

export function SwipeOverlay({ direction }: SwipeOverlayProps) {
  const isRight = direction === "right";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <div
        className={`flex flex-col items-center justify-center p-8 rounded-3xl backdrop-blur-md ${
          isRight ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
        }`}
      >
        <div className={`p-6 rounded-full mb-4 ${isRight ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {isRight ? <Check size={64} strokeWidth={3} /> : <X size={64} strokeWidth={3} />}
        </div>
        <h2 className="text-4xl font-black tracking-widest uppercase">
          {isRight ? "Applied!" : "Skipped"}
        </h2>
      </div>
    </motion.div>
  );
}
