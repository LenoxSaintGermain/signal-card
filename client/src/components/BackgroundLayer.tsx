import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface BackgroundLayerProps {
  type?: "video" | "image" | "gradient";
  src?: string;
  fallbackGradient?: string;
}

export function BackgroundLayer({
  type = "gradient",
  src,
  fallbackGradient = "from-slate-950 via-slate-900 to-slate-950",
}: BackgroundLayerProps) {
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    if (type === "gradient" || !src) {
      setMediaLoaded(true);
    }
  }, [type, src]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Base Gradient Layer (always present) */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${fallbackGradient}`}
      />

      {/* Video Background */}
      {type === "video" && src && !mediaError && (
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setMediaLoaded(true)}
          onError={() => {
            setMediaError(true);
            setMediaLoaded(true);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: mediaLoaded && !mediaError ? 0.4 : 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
        >
          <source src={src} type="video/mp4" />
        </motion.video>
      )}

      {/* Image Background */}
      {type === "image" && src && !mediaError && (
        <motion.img
          src={src}
          alt=""
          onLoad={() => setMediaLoaded(true)}
          onError={() => {
            setMediaError(true);
            setMediaLoaded(true);
          }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{
            opacity: mediaLoaded && !mediaError ? 0.3 : 0,
            scale: 1,
          }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.12),transparent_70%)]" />

      {/* Holographic Grid Floor */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "center",
          transform:
            "perspective(500px) rotateX(60deg) scale(2) translateY(100px)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 100%)",
        }}
      />

      {/* Scan Line Effect */}
      <motion.div
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.6)] pointer-events-none"
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
