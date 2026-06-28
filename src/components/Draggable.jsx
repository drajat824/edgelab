import { useDraggable } from "@dnd-kit/react";

export default function Draggable({ id, children }) {
  const { ref, attributes, listeners, transform, isDragging } = useDraggable({
    id,
  });

  // Ubah transform menjadi inline style CSS
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isDragging ? "none" : "transform 300s ease", 
        zIndex: isDragging ? 999 : undefined,
        opacity: isDragging ? 0.8 : undefined,
      }
    : undefined;

  return (
    <img
      ref={ref}
      style={style}
      {...attributes}
      {...listeners}
      src={children}
      alt="Ground"
      // HAPUS transition-all, ganti spesifik ke properti yang diinginkan saja (misal: shadow/transform saat hover)
      className="w-fit h-15 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-[box-shadow,transform] duration-300 bg-transparent touch-none"
    />
  );
}