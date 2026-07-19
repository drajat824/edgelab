import React from "react";

// Sub-komponen kecil untuk handle bentuk basic (internal saja, tidak perlu di-export)
function BaseItem({ variant = "rectangular", width = "w-full", height = "h-4", className = "" }) {
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${variantClasses[variant]} ${width} ${height} ${className}`} />
  );
}

/**
 * Komponen Skeleton Tunggal Siap Pakai
 * @param {string} type - Pilihan layout: 'dashboard' (default) | 'list' | 'chart'
 */
export default function Skeleton({ type = "dashboard" }) {
  if (type === "dashboard") {
    return (
      <div className="w-full mt-4 space-y-6">
        {/* Header / Title */}
        {/* <BaseItem variant="text" width="w-48" height="h-8" /> */}
        
        {/* Top Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center space-x-3">
                <BaseItem variant="circular" width="w-8" height="h-8" />
                <BaseItem variant="text" width="w-24" height="h-4" />
              </div>
              <BaseItem variant="rectangular" width="w-full" height="h-12" />
            </div>
          ))}
        </div> */}

        {/* Main Content Area (Misal untuk area video stream / chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <BaseItem variant="rectangular" width="w-full" height="h-96" /> {/* Video Box */}
          </div>
          <div className="space-y-4">
            <BaseItem variant="rectangular" width="w-full" height="h-44" />
            <BaseItem variant="rectangular" width="w-full" height="h-48" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <BaseItem variant="rectangular" width="w-full" height="h-96" /> {/* Video Box */}
          </div>
          <div className="space-y-4">
            <BaseItem variant="rectangular" width="w-full" height="h-44" />
            <BaseItem variant="rectangular" width="w-full" height="h-48" />
          </div>
        </div>
      </div>
    );
  }

  // 2. LAYOUT LIST / TABEL DATA (Jika dipanggil di halaman data/history)
  if (type === "list") {
    return (
      <div className="w-full max-w-4xl p-6 space-y-4">
        <BaseItem variant="rectangular" width="w-full sm:w-64" height="h-10" className="mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4 w-2/3">
              <BaseItem variant="circular" width="w-10" height="h-10" className="flex-shrink-0" />
              <div className="space-y-2 w-full">
                <BaseItem variant="text" width="w-1/4" height="h-4" />
                <BaseItem variant="text" width="w-1/2" height="h-3" />
              </div>
            </div>
            <BaseItem variant="rectangular" width="w-16" height="h-7" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}