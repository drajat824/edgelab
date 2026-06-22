import React from "react";

const Checkbox = ({
    checked = false,
    onChange,
    className = "",
}) => {
    return (
        <label
            className={`cursor-pointer inline-flex items-center gap-2 select-none ${className}`}>
            <input type="checkbox" className="sr-only" onChange={(e) => onChange(e.target.checked)} checked={checked} />
            <div className="w-9 h-9 rounded-lg border-2 border-[var(--menu)] flex items-center justify-center hover:bg-[var(--bg)]">
                {!!checked && <div className="w-[60%] h-[60%] bg-[var(--menu)] rounded-md" />}
            </div>
        </label>
    );
};

export default Checkbox;