import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import TextInput from "../components/TextInput"

import Droppable from "../components/Droppable";
import Draggable from "../components/Draggable";

import CARDS from "../components/Cards"
import { CARDS1, CARDS2, CARDS3 } from "../components/CardsTemp"

const defaultBoard = () => ({
  id: "",
  name: "",
  slots: Array.from({ length: 12 }, (_, i) => ({
    id: `slot-${i}`,
    value: null,
  })),
});

const dumyBoards = () => ([{
  id: "board-0",
  name: "Board 1",
  slots: Array.from({ length: 12 }, (_, i) => ({
    id: `slot-${i}`,
    value: CARDS[i * 4],
  })),
},
{
  id: "board-1",
  name: "Board 2",
  slots: Array.from({ length: 12 }, (_, i) => ({
    id: `slot-${i}`,
    value: CARDS[i * 2],
  })),
},
]);

export default function Ground() {

  const [activeBoard, setActiveBoard] = useState(defaultBoard());
  const [boards, setBoards] = useState(dumyBoards());
  const [isAddData, setAddData] = useState(false)

  const onSelectedBoard = (board) => {
    setAddData(false)
    setActiveBoard({
      id: board?.id,
      name: board?.name,
      slots: board?.slots
    })
  }

  const onSave = () => {
    setAddData(false);
    const isExistingBoard = boards.some((board) => board.id === activeBoard.id);
    if (isExistingBoard) {
      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === activeBoard.id
            ? { ...board, name: activeBoard.name, slots: activeBoard.slots }
            : board
        )
      );
    } else {
      setBoards((prevBoards) => [...prevBoards, activeBoard]);
    }
    setActiveBoard(defaultBoard())
  };

  const onAdd = () => {
    setAddData(true)
    const newBoard = defaultBoard();
    newBoard.id = `board-${Date.now()}`;
    newBoard.name = `Board ${boards.length + 1}`;
    setActiveBoard(newBoard);

  };

  return (
    <div className="parent">
      <p className="text-xtitle mb-4">Ground Truth Setting</p>
      <div className="flex flex-col gap-4">
        <div className="card grid grid-cols-4 gap-y-15" style={{ paddingTop: "50px", paddingBottom: "30px" }} >

          {
            boards?.map((e, i) => {
              const totalCards = e?.slots?.filter(slot => slot?.value).length || 0;
              let selected = e?.id == activeBoard?.id ? true : false
              return (
                <button onClick={() => onSelectedBoard(e)} className={`w-[200px] h-[250px] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-white group ${selected ? "shadow-xl -translate-y-1" : "hover:shadow-lg hover:-translate-y-1 transition-all duration-200"}`}>
                  <div className="flex flex-col gap-2 w-[200px]">
                    <div className="flex items-center justify-between px-1 border-none">
                      <span className="text-subinfo uppercase" style={{ fontWeight: 'normal', color: selected ? "blue" : "black" }}>
                        {e?.name}
                      </span>
                      <span className="text-subinfo bg-blue-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
                        {totalCards} CARDS
                      </span>
                    </div>
                    {/* Grid Card */}
                    <div className={`grid grid-cols-4 gap-4 p-4 ${selected ? "border-1 border-blue-500" : "border border-slate-200"} rounded-md h-[250px] items-center justify-items-center bg-white shadow-sm`}>
                      {e.slots.map((card, i) => {
                        return card?.value ? (
                          <img
                            key={i}
                            src={card?.value?.img}
                            alt="Ground"
                            className="w-7 h-15 object-contain"
                          />
                        ) : (
                          /* Tampilkan kotak kosong kecil yang ukurannya sama (w-7 h-15) */
                          <div
                            key={i}
                            className="w-7 h-15 bg-gray-100 rounded-sm border border-dashed border-gray-300"
                          />
                        )
                      })}
                    </div>
                  </div>
                </button>
              )
            })
          }

          <button
            onClick={onAdd}
            className={`w-[200px] h-[250px] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group
    ${isAddData
                ? "border-2 border-blue-500 bg-blue-50/50 shadow-lg -translate-y-1"
                : "border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1"
              }`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl group-hover:scale-100 transition-transform pb-1">
              +
            </div>
            <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800">
              Add New Board
            </p>
          </button>


        </div>

        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) return;

            const { target, source } = event.operation;

            if (!target) return;

            const cardId = source?.id;
            const slotId = target.id;
            const card = CARDS.find((c) => c.id === cardId);

            if (card) {
              setActiveBoard((prev) => ({
                ...prev,
                slots: prev.slots.map((e) => e.id === slotId ? {
                  ...e, value: {
                    id: card.id,
                    img: card.img
                  }
                } : e
                ),
              }));
            }
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

            {/* EDIT BOARD GRID */}
            <div className="card flex flex-col justify-between" style={{ paddingTop: 30, paddingBottom: 30 }}>
              <div className="grid grid-cols-4 gap-2 p-2 border rounded-lg">
                {activeBoard.slots.map((e, i) => {
                  return (
                    <Droppable
                      disabled={!activeBoard?.id?.trim()}
                      isEmpty={!!e.value ? false : true}
                      key={e.id}
                      id={e.id}
                      onClick={() =>
                        setActiveBoard((prev) => ({
                          ...prev, slots: prev.slots.map((s, index) => index === i ? { ...s, value: null } : s),
                        }))
                      }>
                      {e.value && (
                        <>
                          <img src={e?.value?.img} alt="Ground" className="w-15 h-15" />
                        </>
                      )}
                    </Droppable>
                  )
                })}
              </div>
              <div className="flex-none gap-4 flex flex-col" >
                <TextInput disabled={!activeBoard?.id?.trim()} value={activeBoard?.name} placeholder="Input board name" onChange={(e) => setActiveBoard((p) => ({ ...p, name: e.target.value }))} />
                <div className="flex justify-between gap-4">
                  <button className="btn btn-primary text-white flex-1 disabled:bg-gray-300" style={{ cursor: !activeBoard?.id?.trim() ? 'not-allowed' : 'pointer', backgroundColor: activeBoard?.id?.trim() ? '#337D35' : '#7e8186' }} onClick={onSave} disabled={!activeBoard?.id?.trim()}>
                    SAVE
                  </button>
                </div>
              </div>
            </div>

          </div>
        </DragDropProvider>

      </div>
    </div >
  );
}