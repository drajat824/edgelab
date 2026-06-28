import React, { useEffect, useRef } from "react";

const Log = ({
    value = "",
    className = "",
}) => {
    // 1. Buat reference untuk menembak elemen textarea
    const textareaRef = useRef(null);

    // Konversi value ke string agar useEffect bisa memantau perubahannya dengan akurat
    const stringValue = Array.isArray(value) ? value.join("\n") : value;

    // 2. Efek untuk menghitung tinggi otomatis setiap kali stringValue berubah
    useEffect(() => {
        if (textareaRef.current) {
            // Reset tinggi ke auto dulu agar bisa menyusut jika teksnya berkurang
            textareaRef.current.style.height = "auto";
            // Set tinggi baru berdasarkan scrollHeight (tinggi asli konten di dalamnya)
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [stringValue]);

    return (
        <div className={`log-card ${className}`}>
            <p className="text-info" style={{ fontWeight: "bold" }}>
                Generated Command
            </p>
            <div className="mt-4 relative">
                <textarea
                    ref={textareaRef} // Pasang ref di sini
                    disabled
                    value={stringValue}
                    // Tambahan class:
                    // 'whitespace-pre-wrap' agar enter (\n) bekerja
                    // 'resize-none' agar user tidak bisa drag manual
                    // 'overflow-hidden' agar scrollbar bawaan hilang
                    className="w-full px-3 py-2 rounded-lg outline-none text-info bg-[#EBEBEB] cursor-not-allowed border border-black pr-12 whitespace-pre-wrap resize-none overflow-hidden"
                />
            </div>
        </div>
    );
};

export default Log;