"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  className = "",
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const getVariants = () => {
    const distance = 40;
    const variants = {
      hidden: { opacity: 0, x: 0, y: 0 },
      visible: { opacity: 1, x: 0, y: 0 },
    };

    switch (direction) {
      case "up":
        variants.hidden.y = distance;
        break;
      case "down":
        variants.hidden.y = -distance;
        break;
      case "left":
        variants.hidden.x = distance;
        break;
      case "right":
        variants.hidden.x = -distance;
        break;
    }

    return variants;
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={getVariants()}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
