import { useState, useEffect } from "react";

export default function Loading() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500)

    return () => clearInterval(interval); // Bersihkan interval saat komponen di-unmount
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-8">
      <div className="relative flex items-center justify-center h-16 w-16">
        
        {/* Lingkaran luar samar (Background Ring) */}
        <div className="absolute inset-0 rounded-full border-6 border-slate-100 dark:border-slate-400"></div>
        
        {/* Lingkaran utama yang berputar (Spinner Ring) */}
        <div className="absolute inset-0 rounded-full border-6 border-transparent border-t-blue-600 animate-spin"></div>
        
        {/* Efek kilau/glow tipis di tengah */}
        <div className="h-8 w-8 rounded-full bg-blue-500/10 blur-sm animate-pulse"></div>
      </div>

      {/* Teks Status */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-base text-black inline-block w-[85px] text-left">
          Loading{dots}
        </span>
      </div>
    </div>
  );
}