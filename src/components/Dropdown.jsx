import { useState, useRef, useEffect } from "react";
import DropdownIcon from "../assets/dropdown.svg";
import DropdownActive from "../assets/dropdown-active.svg";

export default function Dropdown({
  label = "Select",
  options = [],
  value,
  onChange,
  disabled = false,
  width = "w-fit",
  style = {},
  actived = false,
  inCard = false,
  capslock = true,
  unit = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // close kalau klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${width}`} ref={ref} style={style}>
      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={`flex justify-between items-center gap-4 rounded-lg card-dorpdown cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed h-[45px] transition-colors duration-200 border-[1px] 
    ${actived ? "border-blue-500" : inCard ? "border-black" : "border-transparent"}`}
      >
        <span
          className={`${capslock && "uppercase"} truncate ${actived ? "text-blue-500" : "text-gray-700"}`}
        >
          {value + ` ${unit}` || "Select..."}
        </span>
        <img
          src={actived ? DropdownActive : DropdownIcon}
          alt="Dropdown"
          className={`w-4 h-3 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        /* 1. Tambahkan class "group" pada container dropdown ini */
        <div className="absolute left-0 mt-2 w-full bg-[var(--white)] border border-[#2a2a3a] rounded-lg overflow-hidden z-50 shadow-lg group">
          {options.map((opt, index) => {
            const isSelected = opt === value;

            return (
              <button
                key={index}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                disabled={disabled}
                className={`w-full text-left px-4 py-2 transition cursor-pointer disabled:opacity-50 ${capslock && "uppercase"} hover:bg-[var(--menu)] hover:text-white ${
                  isSelected
                    ? "bg-[var(--menu)] text-white group-hover:bg-transparent group-hover:text-current hover:!bg-[var(--menu)] hover:!text-white"
                    : "text-current"
                }`}
              >
                <p className="truncate">{opt + ` ${unit}`}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
