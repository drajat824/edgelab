import React from "react";

const Log = ({
    value = [], // Sekarang mengekspektasikan array of objects dari fungsi di atas
    className = "",
}) => {
    // Normalisasi input jika tipenya bukan array
    const commandsArray = Array.isArray(value) ? value : [];

    return (
        <div className={`log-card ${className}`}>
            <p className="text-info" style={{ fontWeight: "bold" }}>
                Generated Command
            </p>
            
            <div className="mt-4 space-y-3 p-3 rounded-lg bg-[#EBEBEB] border border-black">
                {commandsArray.length === 0 ? (
                    <span className="text-gray-500 italic text-sm">No commands generated.</span>
                ) : (
                    commandsArray.map((item, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-sm">
                            {/* Styling khusus untuk Label (Contoh: Tebal & Abu-abu Tua) */}
                            <span style={{fontWeight: 'normal'}} className="text-subinfo min-w-[130px] shrink-0">
                                • {item.label}
                            </span>
                            
                            {/* Styling khusus untuk Command (Contoh: Monospace ala terminal) */}
                            <code className="bg-white/60 px-2 py-1 rounded border border-gray-300 font-mono text-md text-green-600 break-all w-full">
                                {item.command}
                            </code>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Log;