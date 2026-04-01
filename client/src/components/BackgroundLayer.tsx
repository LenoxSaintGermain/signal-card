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
  fallbackGradient = "from-[#0B0D12] via-[#0F1320] to-[#0B0D12]",
}: BackgroundLayerProps) {
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const noiseUrl =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E";

  useEffect(() => {
    if (type === "gradient" || !src) {
      setMediaLoaded(true);
    }
  }, [type, src]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base Gradient Layer (always present) */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${fallbackGradient}`}
      />
      {/* Soft Accent Glows */}
      <div className="absolute -top-40 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-emerald-300/15 blur-[140px]" />
      <div className="absolute -bottom-48 left-[-15%] h-[36rem] w-[36rem] rounded-full bg-sky-400/10 blur-[160px]" />

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

      {/* Subtle radial shade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(94,234,212,0.12),transparent_65%)]" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-soft-light pointer-events-none"
        style={{ backgroundImage: `url("${noiseUrl}")`, backgroundSize: "220px 220px" }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,9,12,0.6)_100%)]" />
    </div>
  );
}
