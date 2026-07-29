import React, { useState, useRef } from "react";

const FileInput = ({ id = "fileInput", name = "file", accept = ".tflite", maxSizeMB = 50, onError, onChange, onRemove, disabled = false, className = "" }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Fungsi memvalidasi dan melempar error jika ada masalah
  const validateAndSetFile = (file) => {
    if (!file) return;

    try {
      // 1. Validasi Ekstensi File
      if (accept) {
        const allowedExtensions = accept.split(",").map((ext) => ext.trim().toLowerCase());

        const fileName = file.name.toLowerCase();
        const isValidExtension = allowedExtensions.some((ext) => {
          if (ext.startsWith(".")) {
            return fileName.endsWith(ext);
          }
          if (ext.endsWith("/*")) {
            const typeCategory = ext.split("/")[0];
            return file.type.startsWith(`${typeCategory}/`);
          }
          return file.type === ext;
        });

        if (!isValidExtension) {
          throw new Error(`Format berkas tidak valid. Harap pilih berkas (${accept}).`);
        }
      }

      // 2. Validasi Ukuran File
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`Ukuran berkas terlalu besar. Maksimal ${maxSizeMB}MB.`);
      }

      // Jika validasi sukses, perbarui file dan hapus error di parent (jika ada)
      setSelectedFile(file);
      if (onError) onError(null); // Kirim null untuk membersihkan error di parent
      if (onChange) onChange(file);
    } catch (err) {
      // Bersihkan file yang terpilih jika terjadi error
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onChange) onChange(null);

      // Lempar error ke parent via props onError
      if (onError) {
        onError(err);
      } else {
        // Jika parent tidak menyediakan prop onError, lempar sebagai unhandled error
        throw err;
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
      e.dataTransfer.clearData();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onError) onError(null);
    if (onRemove) onRemove();
    if (onChange) onChange(null);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`w-fit ${className}`}>
      <div className="relative group w-fit">
        <div onClick={() => !disabled && fileInputRef.current?.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`p-2 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${disabled ? "bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed" : isDragging ? "bg-blue-50 border-blue-500 scale-[1.01]" : "bg-slate-50 border-slate-300 hover:bg-blue-50/50 hover:border-blue-400"}`}>
          <input ref={fileInputRef} type="file" id={id} name={name} accept={accept} onChange={handleFileChange} disabled={disabled} className="hidden" />

          <div className="flex flex-col items-center text-center w-fit">
            <svg className={`w-7 transition-colors ${isDragging ? "text-blue-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>

        {/* --- TOOLTIP HOVER --- */}
        {!disabled && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-10 transition-opacity duration-200">
            <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-nowrap bg-slate-800 shadow-lg rounded-md">{"Upload Model Tensorflow Lite (.tflite)"}</span>
            <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-800"></div>
          </div>
        )}
      </div>

      {/* Preview File Terpilih */}
      {selectedFile && (
        <div className="mt-3 flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-center px-2.5 py-1.5 bg-sky-600 text-white font-bold text-xs rounded-md uppercase tracking-wider shrink-0">{selectedFile.name.split(".").pop()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate" title={selectedFile.name}>
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-400">{formatBytes(selectedFile.size)}</p>
          </div>
          <button type="button" onClick={handleRemove} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors text-lg leading-none shrink-0" title="Hapus berkas">
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default FileInput;
