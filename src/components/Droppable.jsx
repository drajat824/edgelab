import { useDroppable } from "@dnd-kit/react";
import { useState } from "react";
import Detele from '../assets/delete-cards.svg'

export default function Droppable({ id, children, onClick, isEmpty = true }) {
  const [isHover, setIsHover] = useState(false);

  const { ref, isOver } = useDroppable({
    id,
  });

  return (
    <button
      onClick={onClick}
      ref={ref}
      className={`relative w-15 h-20 border border-dashed rounded flex items-center justify-center ${!isEmpty ? "cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300" : ""}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}>
      {children}
      {!!isHover && !isEmpty && <div className="absolute inset-0 bg-red-500 z-10 transition-opacity opacity-30" />}
      {!!isHover && !isEmpty && <img src={Detele} alt="Ground" className="w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 z-10 opacity-80" />}
    </button>
  );
}