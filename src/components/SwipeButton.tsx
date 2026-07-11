"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { ArrowRight, Loader2, Check } from "lucide-react";

interface SwipeButtonProps {
  onSuccess: () => void;
  text?: string;
  loadingText?: string;
  successText?: string;
}

export default function SwipeButton({
  onSuccess,
  text = "Swipe to execute",
  loadingText = "Executing...",
  successText = "Success",
}: SwipeButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const THRESHOLD = containerWidth - 60; // container minus button size and padding

  const handleDragEnd = async (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (status !== "idle") return;

    if (info.offset.x >= THRESHOLD * 0.8) {
      // Swiped far enough
      setStatus("loading");
      await controls.start({ x: THRESHOLD });
      
      // Simulate network request or execute real action
      setTimeout(() => {
        setStatus("success");
        onSuccess();
      }, 2000);
    } else {
      // Reset
      controls.start({ x: 0 });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center cursor-pointer"
    >
      <div className="absolute w-full h-full flex items-center justify-center font-bold text-[#0A1C12] pointer-events-none px-12 text-center text-[13px] tracking-wide">
        {status === "idle" && text}
        {status === "loading" && <span className="animate-pulse">{loadingText}</span>}
        {status === "success" && <span>{successText}</span>}
      </div>

      <motion.div
        drag={status === "idle" ? "x" : false}
        dragConstraints={containerRef}
        dragElastic={0.05}
        dragSnapToOrigin={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ x: 0 }}
        style={{ x: 0 }}
        className={`absolute left-2 w-10 h-10 rounded-xl flex items-center justify-center z-10 shadow-sm
          ${status === "idle" ? "bg-white" : status === "loading" ? "bg-white/40" : "bg-white"}`}
      >
        {status === "idle" && <ArrowRight className="text-[#0A1C12] w-5 h-5" strokeWidth={3} />}
        {status === "loading" && <Loader2 className="text-[#0A1C12] w-5 h-5 animate-spin" strokeWidth={3} />}
        {status === "success" && <Check className="text-[#0A1C12] w-5 h-5" strokeWidth={3} />}
      </motion.div>
    </div>
  );
}
