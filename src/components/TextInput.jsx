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
  onInput,
  disabled = false,
  onBlur,
  actived = false
}) => {
  return (
    <div className={`${width} ${className} text-info`}>
      {/* Input wrapper */}
      <div className={`relative border ${actived ? "border-blue-500" : "border-[var(--menu)]"} rounded-lg`}>
        <input
          onInput={onInput}
          type={type}
          onWheel={
            type === "number"
              ? (e) => e.currentTarget.blur()
              : undefined
          }
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-3 rounded-lg py-2 ${actived ? "text-blue-500" : ""} focus:outline-none focus:ring-0 focus:ring-[var(--menu)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-[#EBEBEB] disabled:cursor-not-allowed disabled:opacity-50`}
          disabled={disabled}
        />
        {/* Unit pojok kanan atas */}
        {unit && (
          <div className={`absolute right-[-0.1px] top-0 h-full flex items-center justify-center text-black px-3 rounded-r-lg text-white ${actived ? "bg-blue-500" : "bg-[var(--menu)]"}`}>
            {unit}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInput;