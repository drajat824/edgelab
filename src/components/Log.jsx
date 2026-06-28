import React, { useEffect, useRef } from "react";

const Log = ({
    value = "",
    className = "",
}) => {
    const textareaRef = useRef(null);
    
    const stringValue = Array.isArray(value) 
        ? value.map(line => `• ${line}`).join("\n") 
        : value ? `• ${value}` : "";

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
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
                    ref={textareaRef}
                    disabled
                    value={stringValue}
                    className="w-full px-3 py-2 rounded-lg outline-none text-info bg-[#EBEBEB] border border-black pr-12 whitespace-pre-wrap resize-none overflow-hidden"
                />
            </div>
        </div>
    );
};

export default Log;