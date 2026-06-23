import { useDraggable } from "@dnd-kit/react";

export default function Draggable({ id, children }) {
  const { ref } = useDraggable({
    id,
  });

  return (
    <>
      <img ref={ref} src={children} alt="Ground" className="w-fit h-15 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-transparent" />
    </>
  );
}