import { useState, useEffect } from "react";

// Definisikan breakpoint standard Tailwind CSS
const TAILWIND_BREAKPOINTS = [
  { name: "2xl", min: 1536 },
  { name: "xl", min: 1280 },
  { name: "lg", min: 1024 },
  { name: "md", min: 768 },
  { name: "sm", min: 640 },
  { name: "xs (default mobile)", min: 0 },
];

export default function BreakpointLogger() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Fungsi untuk menentukan nama breakpoint saat ini
  const getBreakpoint = (width) => {
    const found = TAILWIND_BREAKPOINTS.find((bp) => width >= bp.min);
    return found ? found.name : "xs";
  };

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentBreakpoint = getBreakpoint(currentWidth);

      setWindowWidth(currentWidth);

      // Lakukan console.log setiap kali ukuran layar / zoom berubah
      console.log(
        `[ZOOM/RESIZE] Width: ${currentWidth}px | Active Breakpoint: ${currentBreakpoint.toUpperCase()}`
      );
    };

    // Daftarkan event listener saat komponen dipasang
    window.addEventListener("resize", handleResize);

    // Jalankan log sekali di awal saat aplikasi pertama dimuat
    handleResize();

    // Bersihkan event listener saat komponen dilepas
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    // Widget visual kecil di pojok layar agar Anda tidak perlu selalu membuka inspect console
    <div className="fixed bottom-4 left-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-mono shadow-xl border border-slate-700 pointer-events-none opacity-80">
      <span className="text-emerald-400">{windowWidth}px</span>
      <span className="mx-2">|</span>
      <span className="text-yellow-400 font-bold">{getBreakpoint(windowWidth).toUpperCase()}</span>
    </div>
  );
}