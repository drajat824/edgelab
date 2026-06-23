import { useDraggable } from "@dnd-kit/react";

export default function Draggable({ id, children }) {
  const { ref } = useDraggable({
    id,
  });

  return (
    <>
    <img ref={ref} src={children} alt="Ground" className="w-15 h-15 cursor-pointer" />
    </>
    // <div
    //   ref={ref}
    //   className="w-12 h-12 bg-red-500 text-white flex items-center justify-center rounded cursor-grab">
    //   {children}
    // </div>
  );
}