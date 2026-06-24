import React from "react";

const TextInput = ({
  label,
  unit,
  value,
  onChange,
  placeholder = "Enter value",
  className = "",
  type = "text",
  width = "w-full",
  disabled
}) => {
  return (
    <div className={`${width} ${className} text-info`}>
      {/* Input wrapper */}
      <div className="relative border border-[var(--menu)] rounded-lg">
        <input
          type={type}
          onWheel={
            type === "number"
              ? (e) => e.currentTarget.blur()
              : undefined
          }
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-3 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-[var(--menu)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {/* Unit pojok kanan atas */}
        {unit && (
          <div className="absolute right-[-0.1px] top-0 h-full flex items-center justify-center text-black px-3 rounded-r-lg text-white bg-[var(--menu)]">
            {unit}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInput;