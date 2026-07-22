import React, { useEffect, useState } from "react";

/**
 * @param {boolean} isOpen - Status modal terbuka/tertutup
 * @param {Function} onClose - Callback saat modal ditutup / ditekan 'Batal'
 * @param {Function} onConfirm - Callback saat tombol aksi utama (Konfirmasi) ditekan
 * @param {string} type - Tipe modal: 'confirm' | 'warning' | 'error'
 * @param {string} title - Judul modal
 * @param {string} message - Pesan/deskripsi modal
 * @param {string} confirmText - Teks pada tombol aksi utama
 * @param {string} cancelText - Teks pada tombol batal
 * @param {boolean} isLoading - State loading saat tombol aksi ditekan
 */
const ModalAlert = ({
  isOpen,
  onClose,
  onConfirm,
  type = "confirm",
  title,
  message,
  confirmText,
  cancelText = "Batal",
  isLoading = false,
}) => {
  // 1. State lokal untuk mengontrol status render DOM & Animasi
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Saat dibagikan true: Render ke DOM dulu, lalu jalankan animasi masuk
      setShouldRender(true);
      // Gunakan setTimeout tipis agar browser sempat membaca kelas CSS awal sebelum transisi
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      // Saat dibagikan false: Awali animasi tenggelam/keluar
      setIsAnimating(false);
      // Tunggu animasi durasi 200ms selesai sebelum benar-benar di-unmount dari DOM
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Jika modal tidak terbuka dan animasi keluar sudah selesai, stop render
  if (!shouldRender) return null;

  // Konfigurasi style & icon berdasarkan tipe modal
  const typeConfig = {
    confirm: {
      defaultTitle: "Konfirmasi Aksi",
      defaultConfirmText: "Ya, Lanjutkan",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
      iconBg: "bg-blue-100 text-blue-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      defaultTitle: "Peringatan",
      defaultConfirmText: "Mengerti",
      btnColor: "bg-amber-600 hover:bg-amber-700 text-white",
      iconBg: "bg-amber-100 text-amber-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    error: {
      defaultTitle: "Terjadi Kesalahan",
      defaultConfirmText: "Hapus",
      btnColor: "bg-red-600 hover:bg-red-700 text-white",
      iconBg: "bg-red-100 text-red-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
  };

  const currentConfig = typeConfig[type] || typeConfig.confirm;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose} // Tutup modal saat area gelap di luar modal di-klik
    >
      {/* Container Card Dialog */}
      <div
        className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4 transform transition-all duration-200 ease-out ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2"
        }`}
        onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal ikut menutup dialog
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          {/* Badge Icon */}
          <div className={`p-3 rounded-full flex-shrink-0 ${currentConfig.iconBg}`}>
            {currentConfig.icon}
          </div>

          {/* Title & Content */}
          <div className="flex-1 pt-1">
            <h3 className="text-lg font-bold text-gray-900 leading-6">
              {title || currentConfig.defaultTitle}
            </h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100 mt-2">
          {type !== "warning" && cancelText && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm || onClose}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer ${currentConfig.btnColor}`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {confirmText || currentConfig.defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAlert;