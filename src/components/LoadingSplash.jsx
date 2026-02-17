import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function LoadingSplash() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handlePageLoad = () => {
      setIsLoading(false);
    };

    if (document.readyState === "complete") {
      setIsLoading(false);
    } else {
      window.addEventListener("load", handlePageLoad);
      return () => window.removeEventListener("load", handlePageLoad);
    }
  }, []);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(8,8,16,0.95) 0%, rgba(20,15,30,0.95) 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-8">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
          }}
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display"
          style={{
            background: "rgba(232,196,160,0.12)",
            border: "2px solid rgba(232,196,160,0.3)",
            color: "#e8c4a0",
            boxShadow: "0 0 40px rgba(232,196,160,0.2)",
          }}
        >
          M
        </motion.div>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 rounded-full"
              style={{ background: "#e8c4a0" }}
            />
          ))}
        </div>

        <p
          className="text-xs font-body tracking-widest"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          MEMOIRE
        </p>
      </div>
    </motion.div>
  );
}
