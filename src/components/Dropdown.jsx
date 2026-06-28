import { useState, useRef, useEffect } from "react"
import DropdownIcon from "../assets/dropdown.svg"

export default function Dropdown({
    label = "Select",
    options = [],
    value,
    onChange,
    disabled = false,
    width = "w-fit",
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef()

    // close kalau klik di luar
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className={`relative ${width}`} ref={ref}>

            {/* BUTTON */}
            <button
                onClick={() => setOpen(!open)}
                disabled={disabled}
                className="flex justify-between items-center gap-4 rounded-lg card-dorpdown cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed h-[45px]">
                <span className="uppercase">{value || "Select..."}</span>
                <img src={DropdownIcon} alt="Dropdown" className={`w-4 h-3 ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN */}
            {open && (
                <div className="absolute left-0 mt-2 w-full bg-[var(--white)] border border-[#2a2a3a] rounded-lg overflow-hidden z-50 shadow-lg">
                    {options.map((opt, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onChange(opt)
                                setOpen(false)
                            }}
                            disabled={disabled}
                            className="w-full text-left px-4 py-2 hover:bg-[var(--menu)] hover:text-white transition cursor-pointer disabled:opacity-50 uppercase"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}