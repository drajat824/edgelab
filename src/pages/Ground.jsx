import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import TextInput from "../components/TextInput"

import Droppable from "../components/Droppable";
import Draggable from "../components/Draggable";

import CARDS from "../components/Cards"
import { CARDS1, CARDS2, CARDS3 } from "../components/CardsTemp"

const createBoard = () => ({
  id: "board-1",
  slots: Array.from({ length: 12 }, (_, i) => ({
    id: `slot-${i}`,
    value: null,
  })),
});

export default function Ground() {
  const [board, setBoard] = useState(createBoard());

  return (
    <div className="parent">
      <p className="text-xtitle mb-4">Ground Truth Setting</p>

      <div className="flex flex-col gap-4">

        <div className="card grid grid-cols-4" >

          <div className="w-[200px] h-[250px] rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="grid grid-cols-4 gap-4 p-4 border rounded-sm w-[200px] h-[250px] items-center justify-items-center">
              {CARDS1.map((slot, i) => {
                return (
                  <img src={slot?.img} alt="Ground" className="w-7 h-15" />
                )
              })}
            </div>
          </div>

          <div className="w-[200px] h-[250px] rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="grid grid-cols-4 gap-4 p-4 border rounded-sm w-[200px] h-[250px] items-center justify-items-center">
              {CARDS1.map((slot, i) => {
                return (
                  <img src={slot?.img} alt="Ground" className="w-7 h-15" />
                )
              })}
            </div>
          </div>

          <div className="w-[200px] h-[250px] rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl group-hover:scale-100 transition-transform pb-1">
              +
            </div>
            <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800">
              Add Board
            </p>
          </div>


        </div>

        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) return;

            const { target, source } = event.operation;

            if (!target) return;

            const cardId = source?.id;
            const slotId = target.id;
            const card = CARDS.find((c) => c.id === cardId);

            setBoard((prev) => ({
              ...prev,
              slots: prev.slots.map((slot, i) =>
                slot.id === slotId
                  ? { ...slot, value: cardId, img: card.img }
                  : slot
              ),
            }));
          }}
        >
          <div className="flex gap-4">

            {/* PALETTE (tidak hilang, reusable) */}
            <div className="card h-fit flex-1">
              <p className="text-info pl-2 pb-4" style={{ fontWeight: 'bold' }}>DRAG & DROP</p>
              <hr className="border-t border-gray-300 w-[500] -mx-8 pb-6" />

              <div className="grid grid-cols-8 gap-2 pb-4">
                {CARDS.map((card, i) => {
                  return (
                    <Draggable key={card.id} id={card.id}>
                      {card.img}
                    </Draggable>
                  )
                })}
              </div>
            </div>

            {/* BOARD GRID */}
            <div className="card flex flex-col justify-between" style={{ paddingTop: 30, paddingBottom: 30 }}>
              <div className="grid grid-cols-4 gap-2 p-2 border rounded-lg">
                {board.slots.map((slot, i) => {
                  return (

                    <Droppable
                      isEmpty={!!slot.value ? false : true}
                      key={slot.id}
                      id={slot.id}
                      onClick={() =>
                        setBoard((prev) => ({
                          ...prev, slots: prev.slots.map((s, index) => index === i ? { ...s, value: null } : s),
                        }))
                      }
                    >
                      {slot.value && (
                        <>
                          <img src={slot?.img} alt="Ground" className="w-15 h-15" />
                        </>
                      )}
                    </Droppable>
                  )
                })}
              </div>
              <div className="flex-none gap-4 flex flex-col" >
                <TextInput placeholder="Input board name" />
                <div className="flex justify-between gap-4">
                  <button className="btn btn-primary text-white flex-1">
                    SAVE
                  </button>
                  <button className="btn text-red-600 flex-1 border-1 hover:bg-red-100">
                    RESET
                  </button>
                </div>
              </div>
            </div>

          </div>
        </DragDropProvider>

      </div>
    </div>
  );
}