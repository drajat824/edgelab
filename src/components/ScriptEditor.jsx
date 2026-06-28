import { useRef, useState } from "react";

// Daftar resource yang diizinkan untuk divalidasi di frontend
const ALLOWED_VARIABLES = ["cpu_temp", "camera_fps", "inference_running", "hold_frequency"];
const ALLOWED_FUNCTIONS = ["set_frequency", "hold_frequency", "set_min_frequency", "set_max_frequency"];

export default function ScriptEditor({
    title = "Python Script Editor",
    value = "",
    onChange,
    onSave,
    disabled,
    placeholder = `# Example\nif cpu_temp > 70:\n    set_min_frequency()\n`,
    errorMessage = '',
    isDirty = false,
}) {
    const textareaRef = useRef(null);
    const lineNumbersRef = useRef(null);
    const [error, setError] = useState("");

    // Menghitung jumlah baris berdasarkan karakter newline (\n)
    const lineCount = Math.max(value.split("\n").length, 1);

    // 1. Fungsi Sinkronisasi Scroll antara Nomor Baris dan Textarea
    const handleScroll = (e) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.target.scrollTop;
        }
    };

    // 2. Python Mini-Formatter (Merapikan spasi, tab, dan newline berlebih)
    const formatPythonCode = (codeText) => {
        if (!codeText) return "";
        return codeText
            .split("\n")
            .map((line) => {
                let cleaned = line.trimEnd(); // Hapus trailing spaces di ujung kanan
                return cleaned.replace(/\t/g, "    "); // Pastikan tab seragam menjadi 4 spasi
            })
            .join("\n")
            .trimEnd() + "\n"; // Hapus tumpukan baris kosong di akhir dokumen
    };

    // 3. Screening Keamanan & Sintaks di Frontend sebelum dikirim ke Raspi
    const validateCode = (codeText) => {
        if (codeText.includes("import ") || codeText.includes("os.")) {
            return "The use of the 'import' keyword or the 'os' module is strictly prohibited!";
        }
        if (codeText.includes("__")) {
            return "Internal access to dunder ('__') attributes is prohibited for security reasons.";
        }
        return "";
    };

    // Handler ketika tombol Save ditekan
    const handleSave = () => {
        setError("");

        // Jalankan formatter terlebih dahulu
        const formattedCode = formatPythonCode(value);
        onChange(formattedCode);

        // Jalankan uji validasi keamanan
        const validationError = validateCode(formattedCode);
        if (validationError) {
            setError(validationError);
            return;
        }

        // Jika lolos semua pengecekan, kirim kode bersih ke fungsi onSave induk
        if (onSave) {
            onSave(formattedCode);
        }
    };

    return (
        <div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col w-full">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
                    <div>
                        <h2 className="font-semibold text-lg text-gray-800">
                            {title}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Write your userspace governor logic.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                </div>

                {/* Editor Workspace */}
                <div className="flex h-[500px] font-mono relative bg-slate-900">

                    {/* Line Numbers Panel */}
                    <div
                        ref={lineNumbersRef}
                        className="bg-slate-950 text-slate-500 px-4 py-4 text-right select-none overflow-hidden border-r border-slate-800"
                        style={{ lineHeight: "28px" }} // Menyelaraskan dengan leading-7 (28px)
                    >
                        {Array.from({ length: lineCount }).map((_, i) => (
                            <div key={i}>
                                {i + 1}
                            </div>
                        ))}
                    </div>

                    {/* Textarea Input */}
                    <textarea
                        disabled={disabled}
                        ref={textareaRef}
                        spellCheck={false}
                        value={value}
                        onChange={(e) => {
                            setError(""); // Reset error setiap kali user mengetik ulang
                            onChange(e.target.value);
                        }}
                        onScroll={handleScroll}
                        placeholder={placeholder}
                        onKeyDown={(e) => {
                            if (e.key === "Tab") {
                                e.preventDefault();

                                const start = e.target.selectionStart;
                                const end = e.target.selectionEnd;

                                const newValue =
                                    value.substring(0, start) +
                                    "    " + // Mengganti tab ke 4 spasi konvensional Python
                                    value.substring(end);

                                onChange(newValue);

                                // Mengembalikan posisi kursor secara presisi ke depan
                                requestAnimationFrame(() => {
                                    e.target.selectionStart = e.target.selectionEnd = start + 4;
                                });
                            }
                        }}
                        className="
                        flex-1
                        resize-none
                        bg-slate-900
                        text-slate-100
                        px-4
                        py-4
                        leading-7
                        outline-none
                        caret-cyan-400
                        placeholder:text-slate-500
                        disabled:cursor-not-allowed
                        overflow-y-auto
                    "
                    />
                </div>

                {/* Footer & Balikan Pesan Validasi */}
                <div className="flex px-5 py-4 border-t bg-gray-50">
                    <button
                        onClick={handleSave}
                        disabled={disabled || !value.trim() || !isDirty || error || errorMessage}
                        className="
                        px-5 py-2
                        rounded-xl
                        bg-blue-600 
                        hover:bg-blue-700
                        text-white
                        font-medium
                        transition
                        cursor-pointer
                        disabled:cursor-not-allowed
                        disabled:bg-gray-300
                        disabled:text-gray-500
                        shadow-sm
                        w-full
                    "
                    >
                        VALIDATE SCRIPT
                    </button>
                </div>
            </div>

            <div className="mt-4 text-left">
                {(error || errorMessage) && (
                    <p className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg inline-block">
                        ⚠️ {error || errorMessage}
                    </p>
                )}
            </div>

        </div>
    )
}