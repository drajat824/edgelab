import React from "react";

export default function ActionLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
      {/* Box Spinner */}
      <div className="flex items-center space-x-4 rounded-xl bg-white px-6 py-4 shadow-2xl dark:bg-gray-800">
        {/* CONTAINER SPINNER OVAL MENYILANG */}
        <div className="relative flex items-center justify-center h-16 w-16">
          <div className="absolute inset-0 rounded-full border-6 border-slate-100 dark:border-slate-400"></div>
          <div className="absolute inset-0 rounded-full border-6 border-transparent border-t-blue-600 animate-spin"></div>
          <div className="h-8 w-8 rounded-full bg-blue-500/10 blur-sm animate-pulse"></div>
        </div>

        {/* Teks Default */}
        <span className="text-xl font-medium text-gray-800 dark:text-gray-200">Wait a moment..</span>
      </div>
    </div>
  );
}
