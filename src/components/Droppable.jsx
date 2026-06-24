import { useDroppable } from "@dnd-kit/react";
import { useState } from "react";
import Detele from '../assets/delete-cards.svg'

export default function Droppable({ id, children, onClick, isEmpty = true, disabled }) {
  const [isHover, setIsHover] = useState(false);

  const { ref, isOver } = useDroppable({
    id,
  });

  return (
    disabled ? (
      /* Tampilan saat DISABLED (tidak bisa diinteraksi, tidak ada efek hover) */
      <div
        className="relative w-15 h-20 border border-gray-200 bg-gray-400 rounded flex items-center justify-center cursor-not-allowed opacity-60"
      >
        {children}
      </div>
    ) : (
      /* Tampilan saat AKTIF (bisa diinteraksi & bisa hapus kartu) */
      <button
        onClick={onClick}
        ref={ref}
        className={`relative w-15 h-20 border border-dashed rounded flex items-center justify-center transition-all duration-300 ${!isEmpty ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : "border-gray-300"}`}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}>
        {children}
        {isHover && !isEmpty && (
          <>
            <div className="absolute inset-0 bg-red-500 z-10 opacity-30 rounded" />
            <img
              src={Detele}
              alt="Delete"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 z-20 opacity-90"
            />
          </>
        )}
      </button>
    )
  );
}