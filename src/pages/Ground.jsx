import { useEffect, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import TextInput from "../components/TextInput"

import Droppable from "../components/Droppable";
import Draggable from "../components/Draggable";

import CARDS from "../components/Cards"
import { CARDS1, CARDS2, CARDS3 } from "../components/CardsTemp"

import Delete from "../assets/delete.svg"

// State Management
import useGround from "../hooks/useGround"

const defaultBoard = () => ({
  id: "",
  name: "",
  slots: Array.from({ length: 12 }, (_, i) => ({
    id: `slot-${i}`,
    value: null,
  })),
});

export default function Ground() {

  const { boards, dispatch } = useGround()
  // console.log(boards)

  useEffect(() => {
    if (!boards) return;

    const transformed = boards.map((globalBoard) => ({
      id: globalBoard.board_id,
      name: globalBoard.board_name,
      slots: globalBoard.ground_truth.map((cardId, index) => ({
        id: `slot-${index}`,
        value: CARDS.find((card) => card.id === cardId) || null,
      })),
    }));

    setDisplayBoards(transformed);
  }, [boards]);

  const [draftBoard, setDraftBoard] = useState(defaultBoard());
  const [displayBoards, setDisplayBoards] = useState();
  const [isAddData, setAddData] = useState(false);

  const isBoardEmpty = draftBoard?.slots?.every((slot) => slot.value === null) || !draftBoard?.name?.trim();
  const isSaveDisabled = !draftBoard?.id?.trim()

  const onSelectedBoard = (board) => {
    setAddData(false)
    setDraftBoard({
      id: board?.id,
      name: board?.name,
      slots: board?.slots
    })
  }

  const onSave = () => {
    setAddData(false);
    const boardToSave = {
      board_id: draftBoard.id,
      board_name: draftBoard.name,
      ground_truth: draftBoard.slots.map((slot) => slot.value ? slot.value.id : null),
    };

    dispatch({
      type: "SAVE_BOARD",
      payload: boardToSave,
    });

    // Reset tampilan
    setDraftBoard(defaultBoard());
  };

const onDelete = (id) => {
    dispatch({
      type: "DELETE_BOARD",
      payload: id,
    });
  };

  const onAdd = () => {
    setAddData(true)
    const newBoard = defaultBoard();
    newBoard.id = `board-${Date.now()}`;
    newBoard.name = `Board ${displayBoards.length + 1}`;
    setDraftBoard(newBoard);
  };

  return (
    <div className="parent">
      <h1 className="text-xtitle">
        Ground Truth
      </h1>
      <p className="text-subinfo mt-2 text-gray-500 pb-5">
        Configure the board's ground truth based on the available cards.
      </p>
      <div className="flex flex-col gap-4">
        <div className="card grid grid-cols-1 lg:grid-cols-2 laptop:grid-cols-4 gap-y-5 gap-x-4 items-center" style={{ paddingTop: "30px", paddingBottom: "30px" }} >
          {
            displayBoards?.map((e, i) => {
              const totalCards = e?.slots?.filter(slot => slot?.value).length || 0;
              let selected = e?.id == draftBoard?.id ? true : false
              return (
                <div className="flex flex-col gap-3 justify-center items-center" >
                  <div className="flex items-center justify-between px-1 border-none w-[200px]">
                    <span className="text-subinfo uppercase truncate" style={{ fontWeight: 'normal', color: selected ? "blue" : "black" }}>
                      {e?.name}
                    </span>
                    <span className="text-subinfo bg-blue-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium text-center truncate">
                      {totalCards} CARDS
                    </span>
                  </div>
                  <button onClick={() => onSelectedBoard(e)} className={`w-[200px] h-[250px] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-white group ${selected ? "shadow-lg shadow-blue-300 -translate-y-1" : "hover:shadow-lg hover:-translate-y-1 transition-all duration-200"}`}>
                    <div className="flex flex-col gap-2 w-[200px]">
                      {/* Grid Card */}
                      <div className={`grid grid-cols-4 gap-4 p-4 ${selected ? "border border-blue-500" : "border border-slate-200"} rounded-md h-[250px] items-center justify-items-center bg-white shadow-sm`}>
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
                  <button className="btn bg-red-500 hover:bg-red-600 text-white w-[200px] flex items-center justify-center gap-1 transition-colors duration-200" onClick={() => onDelete(e.id)}>
                    <img src={Delete} className="w-5 h-5" />
                    <p className="text-subinfo" style={{ color: 'white', fontWeight: 'normal' }}>DELETE</p>
                  </button>
                </div>
              )
            })
          }

          <div className="flex items-center justify-center" >
            <button
              onClick={onAdd}
              className={`w-[200px] h-[250px] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group 
              ${isAddData
                  ? "border border-blue-500 shadow-blue-300 shadow-lg -translate-y-1"
                  : "border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1"
                }`}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl group-hover:scale-100 transition-transform pb-1">
                +
              </div>
              <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800">
                Add New Board
              </p>
            </button>
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

            if (card) {
              setDraftBoard((prev) => ({
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

          <div className="flex flex-col laptop:flex lg:flex-row gap-4">

            {/* PALETTE (tidak hilang, reusable) */}
            <div className="card h-fit flex-1">
              <p className="text-info pl-2 pb-4" style={{ fontWeight: 'bold' }}>DRAG & DROP</p>
              <hr className="border-t border-gray-300 w-[500] -mx-8 pb-6" />

              <div className="grid grid-cols-8 gap-2 pb-4 justify-items-center">
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
              <div className="grid grid-cols-4 gap-2 p-2 border rounded-lg place-items-center">
                {draftBoard.slots.map((e, i) => {
                  return (
                    <Droppable
                      disabled={isSaveDisabled}
                      isEmpty={!!e.value ? false : true}
                      key={e.id}
                      id={e.id}
                      onClick={() =>
                        setDraftBoard((prev) => ({
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
              <div className="flex-none flex flex-col gap-2 pt-4" >
                <p className="text-info" style={{ fontWeight: "bold" }} >Board Name</p>
                <TextInput disabled={isSaveDisabled} value={draftBoard?.name} placeholder="Input board name" onChange={(e) => setDraftBoard((p) => ({ ...p, name: e.target.value }))} />
                <div className="flex justify-between gap-4">
                  <button className="btn btn-primary text-white flex-1 disabled:bg-gray-300" style={{ cursor: isSaveDisabled || isBoardEmpty ? 'not-allowed' : 'pointer', backgroundColor: isSaveDisabled || isBoardEmpty ? '#7e8186' : '#337D35' }} onClick={onSave} disabled={isSaveDisabled || isBoardEmpty}>
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