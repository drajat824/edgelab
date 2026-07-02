import React from "react";

const Checkbox = ({
    checked = false,
    onChange,
    className = "",
    disabled = false,
    actived = false
}) => {
    return (
        <label
            className={`inline-flex items-center gap-2 select-none 
                ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} 
                ${className}`} >
            <input
                type="checkbox"
                className="sr-only"
                onChange={(e) => !disabled && onChange(e.target.checked)}
                checked={checked}
                disabled={disabled}
            />

            <div
                className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-colors
                    ${disabled
                        ? "border-gray-600 bg-slate-800"
                        : actived
                            ? "border-blue-500"
                            : "border-[var(--menu)] hover:bg-[var(--bg)]"
                    }`}>
                {!!checked && (
                    <div
                        className={`w-[60%] h-[60%] rounded-md transition-all
                            ${disabled ? "bg-gray-500" : actived ? "bg-blue-500" : "bg-[var(--menu)]"}`}
                    />
                )}
            </div>
        </label>
    );
};

export default Checkbox;