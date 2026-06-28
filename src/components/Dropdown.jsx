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
                <span className="uppercase truncate">{value || "Select..."}</span>
                <img src={DropdownIcon} alt="Dropdown" className={`w-4 h-3 ${open ? 'rotate-180' : ''}`} />
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
                                    onChange(opt)
                                    setOpen(false)
                                }}
                                disabled={disabled}
                                /* 
                                  2. Logika Class Baru:
                                  - Semua item punya efek `hover:bg-[var(--menu)] hover:text-white`.
                                  - Jika `isSelected` true, kita beri warna dasar aktif.
                                  - Triknya: Kita tambahkan `group-hover:bg-transparent group-hover:text-inherit` agar saat dropdown mendeteksi ada hover di areanya, warna item yang selected otomatis mengalah (jadi transparan), KECUALI item selected itu sendiri yang sedang di-hover (`hover:bg-[var(--menu)]`).
                                */
                                className={`w-full text-left px-4 py-2 transition cursor-pointer disabled:opacity-50 uppercase hover:bg-[var(--menu)] hover:text-white ${isSelected
                                        ? "bg-[var(--menu)] text-white group-hover:bg-transparent group-hover:text-current hover:!bg-[var(--menu)] hover:!text-white"
                                        : "text-current"
                                    }`}
                            >
                                <p className="truncate">{opt}</p>

                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    )
}