import React from "react";

export default function ActionLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
      {/* Box Spinner */}
      <div className="flex items-center space-x-4 rounded-xl bg-white px-6 py-4 shadow-2xl dark:bg-gray-800">
        {/* CONTAINER SPINNER OVAL MENYILANG */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          {/* Oval 1: Miring ke Kanan */}
          <div
            className="absolute h-full w-full animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400"
            style={{ transform: "rotateX(60deg) rotateY(20deg)" }}
          />
          {/* Oval 2: Miring ke Kiri (Menyilang) */}
          <div
            className="absolute h-full w-full animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400"
            style={{
              transform: "rotateX(60deg) rotateY(-20deg)",
              animationDirection: "reverse",
            }}
          />
        </div>

        {/* Teks Default */}
        <span className="text-xl font-medium text-gray-800 dark:text-gray-200">
          Wait a moment..
        </span>
      </div>
    </div>
  );
}
