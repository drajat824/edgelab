// 1. React & Standard Libraries
import { useEffect, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";

// 2. Components
import Draggable from "../components/Draggable";
import Droppable from "../components/Droppable";
import TextInput from "../components/TextInput";
import Skeleton from "../components/Skeleton";
import ActionLoading from "../components/ActionLoading";
import CARDS from "../components/Cards";
import ModalAlert from "../components/ModalAlert";

// 3. Hooks & State Management
import useGround from "../hooks/useGround";

// 4. Services / API
import apiServices from "../services/apiServices";

// 5. Assets & Static Media
import Delete from "../assets/delete.svg";
import CardsLogo from "../assets/cardsLogo.png";

const defaultBoard = () => ({
  id: "",
  name: "",
  slots: Array.from({ length: 15 }, (_, i) => ({
    id: `slot-${i}`,
    value: null,
  })),
});

export default function Ground() {
  // 1. Hooks & Global/Local States
  const { boards, dispatch } = useGround();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [displayBoards, setDisplayBoards] = useState([]);
  const [draftBoard, setDraftBoard] = useState(defaultBoard());
  const [isAddData, setAddData] = useState(false);

  // ModalAlert
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: null,
  });

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // 2. Computed Values & Form Validations
  const isBoardEmpty = draftBoard?.slots?.every((slot) => slot.value === null) || !draftBoard?.name?.trim();
  const isNameSame = displayBoards?.some((board) => board.name.trim().toLowerCase() === draftBoard?.name?.trim().toLowerCase() && board.id !== draftBoard?.id);
  const isSaveDisabled = !draftBoard?.id?.trim() || !draftBoard?.name?.trim();

  // 3. Helper Functions
  const transformBoardsData = (rawBoards) => {
    if (!rawBoards?.length) return [];

    return rawBoards.map((globalBoard) => ({
      id: globalBoard.board_id,
      name: globalBoard.board_name,
      slots: globalBoard.ground_truth.map((cardId, index) => ({
        id: `slot-${index}`,
        value: CARDS.find((card) => card.id === cardId) || null,
      })),
    }));
  };

  // Helper untuk menjaga animasi loading tetap smooth (menghindari 'flicker')
  const withMinimumDelay = async (asyncFn, minDelay = 400) => {
    const startTime = Date.now();
    try {
      await asyncFn();
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDelay - elapsedTime);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
    }
  };

  // 4. API Calls & Data Synchronization
  const fetchBoards = async (isInitial = false) => {
    if (isInitial) setIsInitialLoading(true);

    await withMinimumDelay(async () => {
      try {
        const response = await apiServices.getGT();
        if (response?.data) {
          // Sync State Global (Context/Redux)
          dispatch({ type: "SET_BOARDS", payload: response.data });

          // Sync State Lokal (UI Slots)
          const transformed = transformBoardsData(response.data);
          setDisplayBoards(transformed);
        }
      } catch (error) {
        setModalConfig({
          isOpen: true,
          type: "warning",
          title: "Failed",
          message: error?.message || "Failed to retrieve board data.",
          confirmText: "OK",
          cancelText: "",
          onConfirm: closeModal,
        });
      }
    }, 500);

    if (isInitial) setIsInitialLoading(false);
  };

  useEffect(() => {
    fetchBoards(true);
  }, []);

  // 5. User Interaction Handlers
  const onSelectedBoard = (board) => {
    setAddData(false);
    setDraftBoard({
      id: board?.id,
      name: board?.name,
      slots: board?.slots,
    });
  };

  const onAdd = () => {
    setAddData(true);
    const newBoard = defaultBoard();
    const nextNumber = (displayBoards?.length || 0) + 1;
    newBoard.id = `board-${Date.now()}`;
    newBoard.name = `Board ${nextNumber}`;
    setDraftBoard(newBoard);
  };

  const onSave = async () => {
    setIsActionLoading(true);
    const groundTruthValues = draftBoard.slots.map((slot) => (slot.value ? slot.value.id : ""));
    const boardToSave = {
      board_id: draftBoard.id,
      board_name: draftBoard.name,
      ground_truth: groundTruthValues,
    };

    await withMinimumDelay(async () => {
      try {
        const isExisting = boards?.some((b) => b.board_id === draftBoard.id);

        if (isExisting) {
          await apiServices.updateGT(boardToSave.board_id, boardToSave.board_name, boardToSave.ground_truth);
        } else {
          await apiServices.addGT(boardToSave.board_id, boardToSave.board_name, boardToSave.ground_truth);
        }

        // Re-fetch
        await fetchBoards(false);

        // Reset Form
        setAddData(false);
        setDraftBoard(defaultBoard());
      } catch (error) {
        setModalConfig({
          isOpen: true,
          type: "warning",
          title: "Failed",
          message: error?.message || "Failed to save data to the server.",
          confirmText: "OK",
          cancelText: "",
          onConfirm: closeModal,
        });
      }
    }, 400);

    setIsActionLoading(false);
  };

  const onDelete = (id) => {
    setModalConfig({
      isOpen: true,
      type: "error", // Merah untuk aksi hapus
      title: "Deletion Confirmation",
      message: "Are you sure you want to delete this board? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => confirmDelete(id),
    });
  };

  const confirmDelete = async (id) => {
    closeModal();
    setIsActionLoading(true);

    await withMinimumDelay(async () => {
      try {
        await apiServices.deleteGT({ board_id: id });
        await fetchBoards(false);
      } catch (error) {
        setModalConfig({
          isOpen: true,
          type: "warning",
          title: "Failed",
          message: error?.response?.data?.detail || "Failed to delete the board from the server.",
          confirmText: "OK",
          cancelText: "",
          onConfirm: closeModal,
        });
      }
    }, 400);

    setIsActionLoading(false);
  };

  if (!!isInitialLoading)
    return (
      <div className="parent">
        <h1 className="text-xtitle">Ground Truth</h1>
        <p className="text-subinfo mt-2 text-gray-500">Configure the board's ground truth based on the available cards.</p>
        <Skeleton />
      </div>
    );

  return (
    <div className="parent">
      <h1 className="text-xtitle">Ground Truth</h1>
      <p className="text-subinfo mt-2 text-gray-500 pb-5">Configure the board's ground truth based on the available cards.</p>
      <div className="flex flex-col gap-4">
        <div className="card grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-y-5 gap-x-4 items-center" style={{ paddingTop: "30px", paddingBottom: "30px" }}>
          {displayBoards?.map((e, i) => {
            const totalCards = e?.slots?.filter((slot) => slot?.value).length || 0;
            let selected = e?.id == draftBoard?.id ? true : false;
            return (
              <div className="flex flex-col gap-3 justify-center items-center">
                <div className="flex items-center justify-between px-1 border-none w-[200px]">
                  <span
                    className="text-subinfo uppercase truncate"
                    style={{
                      fontWeight: "normal",
                      color: selected ? "blue" : "black",
                    }}
                  >
                    {e?.name}
                  </span>
                  <span className="text-subinfo bg-blue-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium text-center truncate">{totalCards} CARDS</span>
                </div>
                <button onClick={() => onSelectedBoard(e)} className={`w-[210px] h-[250px] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-white group ${selected ? "shadow-lg shadow-blue-300 -translate-y-1" : "hover:shadow-lg hover:-translate-y-1 transition-all duration-200"}`}>
                  <div className="flex flex-col gap-2">
                    {/* Grid Card */}
                    <div className={`grid grid-cols-5 gap-4 p-4 ${selected ? "border border-blue-500" : "border border-black-200"} rounded-md h-[250px] items-center justify-items-center bg-white shadow-sm`}>
                      {e.slots.map((card, i) => {
                        return card?.value ? <img key={i} src={card?.value?.img} alt="Ground" className="w-7 h-15 object-contain" /> : <div key={i} className="w-7 h-15 bg-gray-100 rounded-sm border border-dashed border-gray-300" />;
                      })}
                    </div>
                  </div>
                </button>
                <button className="btn bg-red-500 hover:bg-red-600 text-white w-[210px] flex items-center justify-center gap-1 transition-colors duration-200" onClick={() => onDelete(e.id)}>
                  <img src={Delete} className="w-5 h-5" />
                  <p className="text-subinfo" style={{ color: "white", fontWeight: "normal" }}>
                    DELETE
                  </p>
                </button>
              </div>
            );
          })}

          <div className="flex items-center justify-center">
            <button
              onClick={onAdd}
              className={`w-[200px] h-[250px] rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group 
              ${isAddData ? "border border-blue-500 shadow-blue-300 shadow-lg -translate-y-1 bg-blue-100" : "border border-black-300 hover:shadow-lg hover:-translate-y-1 "}`}
            >
              <p className="text-xl text-gray-600 group-hover:text-gray-800">Add New Board</p>

              <img src={CardsLogo} alt="Poker Logo" className="w-40" />

              <div className="absolute w-10 h-10 mb-[-110px] mr-[-55px] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl group-hover:scale-100 transition-transform pb-1">
                <p className="text-3xl font-semibold">+</p>
              </div>
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
                slots: prev.slots.map((e) =>
                  e.id === slotId
                    ? {
                        ...e,
                        value: {
                          id: card.id,
                          img: card.img,
                        },
                      }
                    : e,
                ),
              }));
            }
          }}
        >
          <div className="flex flex-col laptop:flex lg:flex-row gap-4">
            <div className="card h-fit flex-1">
              <p className="text-info pl-2 pb-4" style={{ fontWeight: "bold" }}>
                DRAG & DROP
              </p>
              <hr className="border-t border-gray-300 w-[500] -mx-8 pb-6" />

              <div className="grid grid-cols-8 gap-2 pb-4 justify-items-center">
                {CARDS.map((card, i) => {
                  return (
                    <Draggable key={card.id} id={card.id}>
                      {card.img}
                    </Draggable>
                  );
                })}
              </div>
            </div>

            {/* EDIT BOARD GRID */}
            <div className="card flex flex-col justify-between" style={{ paddingTop: 30, paddingBottom: 30 }}>
              <div className="grid grid-cols-5 gap-2 p-2 border rounded-lg place-items-center">
                {draftBoard.slots.map((e, i) => {
                  return (
                    <Droppable
                      disabled={isSaveDisabled}
                      isEmpty={!!e.value ? false : true}
                      key={e.id}
                      id={e.id}
                      onMouseDown={() =>
                        setDraftBoard((prev) => ({
                          ...prev,
                          slots: prev.slots.map((s, index) => (index === i ? { ...s, value: null } : s)),
                        }))
                      }
                    >
                      {e.value && (
                        <>
                          <img src={e?.value?.img} alt="Ground" className="w-15 h-15" />
                        </>
                      )}
                    </Droppable>
                  );
                })}
              </div>
              <div className="flex-none flex flex-col gap-2 pt-4">
                <p className="text-info" style={{ fontWeight: "bold" }}>
                  Board Name
                </p>
                <TextInput disabled={isSaveDisabled} value={draftBoard?.name} placeholder="Input board name" onChange={(e) => setDraftBoard((p) => ({ ...p, name: e.target.value }))} />
                <div className="flex justify-between gap-4">
                  <button
                    className="btn btn-primary text-white flex-1 disabled:bg-gray-300"
                    style={{
                      cursor: isSaveDisabled || isBoardEmpty || isNameSame ? "not-allowed" : "pointer",
                      backgroundColor: isSaveDisabled || isBoardEmpty || isNameSame ? "#7e8186" : "#337D35",
                    }}
                    onClick={onSave}
                    disabled={isSaveDisabled || isBoardEmpty || isNameSame}
                  >
                    SAVE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DragDropProvider>
      </div>
      {!!isActionLoading ? <ActionLoading /> : <ModalAlert isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} message={modalConfig.message} confirmText={modalConfig.confirmText} cancelText={modalConfig.cancelText} onClose={closeModal} onConfirm={modalConfig.onConfirm} />}
    </div>
  );
}
