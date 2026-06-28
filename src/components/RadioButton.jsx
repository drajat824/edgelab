import React from "react";

const RadioButton = ({
  options = [],
  value,
  onChange,
  name,
  className = "",
  multiple = false,
}) => {
  const handleChange = (optionValue) => {
    if (!multiple) {
      onChange(optionValue);
      return;
    }

    const values = Array.isArray(value) ? value : [];

    if (values.includes(optionValue)) {
      onChange(values.filter((v) => v !== optionValue));
    } else {
      onChange([...values, optionValue]);
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className} text-info`}>
      {options.map((opt, index) => {
        const id = `${name}-${index}`;

        const checked = multiple
          ? value?.includes(opt.value)
          : value === opt.value;

        return (
          <label
            key={id}
            htmlFor={id}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              id={id}
              type={multiple ? "checkbox" : "radio"}
              name={name}
              checked={checked}
              onChange={() => handleChange(opt.value)}
              className="accent-blue-500 w-4 h-4"
            />

            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
};

export default RadioButton;