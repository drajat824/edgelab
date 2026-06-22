import React from "react";

const RadioButton = ({ options = [], value, onChange, name, className = "" }) => {
  return (
    <div className={`flex gap-6 ${className} text-info`}>
      {options.map((opt, index) => {
        const id = `${name}-${index}`;

        return (
          <label
            key={id}
            htmlFor={id}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-blue-500 w-4 h-4"
            />

            <span >{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
};

export default RadioButton;