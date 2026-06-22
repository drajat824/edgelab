import { useEffect, useState } from "react";

export default function DesktopOnly({ children }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isDesktop) {
    return (
      <div className="p-6 text-left text-gray-500">
        Aplikasi ini belum mendukung tampilan mobile. Harap gunakan perangkat desktop. Jika tampilan terkendala, silakan zoom-out layar broswer pada desktop Anda.
      </div>
    );
  }

  return children;
}