// 1. React Core & Hooks
import { useState, useEffect, useRef } from "react";

// 2. State Management & Custom Hooks
import useCPU from "../hooks/useCPU";
import useGround from "../hooks/useGround";

// 3. API & Data Services
import apiServices from "../services/apiServices";

// 4. Reusable UI Components
import ProgressBar from "../components/ProgressBar";
import Dropdown from "../components/Dropdown";
import TextInput from "../components/TextInput";
import Loading from "../components/Loading.jsx";
import Skeleton from "../components/Skeleton.jsx";
import ActionLoading from "../components/ActionLoading.jsx";
import ModalAlert from "../components/ModalAlert";
import FileInput from "../components/InputFile.jsx";

// 5. Assets, Images & Constants
import Play from "../assets/play.svg";
import Stop from "../assets/stop.svg";
import CARDS from "../components/Cards";

export default function Main() {
  // Custom Hooks Configuration Context
  const { cpu, dispatch } = useCPU();
  const { boards, dispatch: dispatchGround } = useGround();

  // Static API Endpoints
  const videoUrl = `${import.meta.env.VITE_API_AI}/video`;

  // Global Page Loading States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Static API Endpoints Metrics
  const [cpuUtilization, setCpuUtilization] = useState({
    average: 0,
    core: [0, 0, 0, 0],
  });
  const [cpuStatus, setCpuStatus] = useState({
    frequency: "0.0 GHz",
    temperature: 0.0,
  });

  // Object Detection Model & Camera Framing
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(cpu?.selectedModel);
  const [cameraFps, setCameraFps] = useState(cpu?.fpsCamera);
  const [streamMode, setStreamMode] = useState(null); // 0: Stop, 1: Detetction, 2: Calibrate
  const [inferenceFps, setInferenceFps] = useState();
  const [forwardPass, setForwardPass] = useState();
  const [cameraError, setCameraError] = useState("");
  const [file, setFile] = useState(null);
  const [evaluationData, setEvaluationData] = useState([]);

  // Ground Truth Evaluation Board Targets
  const [itemBoard, setItemBoard] = useState({});
  const [selectedBoard, setSelectedBoard] = useState(null);

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

  // Helper Minimum Delay
  const withMinimumDelay = async (action, delayMs = 500) => {
    const startTime = Date.now();
    await action();
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, delayMs - elapsedTime);
    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }
  };

  // Function Fetch Boards (Ground Truth)
  const fetchBoards = async () => {
    try {
      const response = await apiServices.getGT();
      if (response?.data) {
        // Sync State Global
        dispatchGround({ type: "SET_BOARDS", payload: response.data });

        // Auto select board pertama jika belum ada yang terpilih
        // if (response.data.length > 0 && !selectedBoard) {
        //   setSelectedBoard(response.data[0]?.board_id);
        // }
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
      throw new Error(error?.response?.data?.detail || error?.message || "Failed to retrieve board data.");
    }
  };

  // Handle file error
  const timeoutRef = useRef(null);
  const handleFileError = (error) => {
    if (error) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setModalConfig({
          isOpen: true,
          type: "warning",
          title: "File Error",
          message: error?.message,
          confirmText: "OK",
          cancelText: "",
          onConfirm: closeModal,
        });
      }, 500);
    }
  };

  // Clear timeout file error
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Main Initial Load (Combine Hardware Data + Boards GT Data)
  useEffect(() => {
    setIsInitialLoading(true);

    const fetchInitialData = async () => {
      await withMinimumDelay(async () => {
        try {
          await Promise.all([
            // Sync Hardware Configurations
            apiServices.getGovernorStatus().then(async (data) => {
              dispatch({ type: "CHANGE_GOVERNOR", payload: data.governor });
              if (data?.governor === "userspace" && data?.tunables?.isDynamicScripting) {
                await apiServices.startDynamicScripting();
              } else {
                await apiServices.stopDynamicScripting();
              }
            }),
            apiServices.getThread().then((data) => {
              dispatch({ type: "CHANGE_THREAD_CONFIG", payload: data?.thread });
            }),
            apiServices.getCore().then((data) => {
              dispatch({ type: "CHANGE_CORE_CONFIG", payload: data?.core });
            }),
            apiServices.getFps().then((data) => {
              dispatch({ type: "CHANGE_FPS_CONFIG", payload: data?.fps_camera });
            }),
            apiServices.stopVideo().then((data) => {
              // if (data?.stream_status === "start") setStreamMode(1);
              if (data?.stream_status === "stop") {
                setStreamMode(0);
              }
            }),
            apiServices.getModel().then((data) => {
              const resData = data?.data || data;
              dispatch({ type: "GET_MODELS", payload: resData?.models });
              dispatch({ type: "CHANGE_SELECTED_MODEL", payload: resData?.selected_model });
            }),
            // Sync Boards GT Data
            fetchBoards(),

            // Sync Active Ground Truth Board
            apiServices.getActiveGT().then((data) => {
              setSelectedBoard(data?.data);
            }),
          ]);
        } catch (err) {
          console.error("Initial Sync Error:", err);
          setStreamMode(null);
          setModalConfig({
            isOpen: true,
            type: "warning",
            title: "Sync Failed",
            message: err?.message || "Failed to synchronize initial hardware or board data.",
            confirmText: "OK",
            cancelText: "",
            onConfirm: closeModal,
          });
        }
      }, 500);

      setIsInitialLoading(false);
    };

    fetchInitialData();
    return () => {
      apiServices.stopDynamicScripting().catch((err) => {
        console.error("Cleanup Stop:", err);
      });
    };
  }, [dispatch]);

  // Keep Sync Camera FPS inside Local Draft State with CPU Context Updates
  useEffect(() => {
    setCameraFps(cpu?.fpsCamera);
  }, [cpu?.fpsCamera]);

  useEffect(() => {
    setSelectedModel(cpu?.selectedModel);
  }, [cpu?.selectedModel]);

  useEffect(() => {
    setModels(cpu?.models);
  }, [cpu?.models]);

  // Match Selected Evaluation Board with Local Reference JSON Data
  useEffect(() => {
    if (!selectedBoard) return;

    // 1. Penanganan khusus jika selectedBoard bernilai 'NONE'
    if (selectedBoard === "NONE") {
      setItemBoard({
        id: "NONE",
        name: "NONE",
        slots: [], // Mengosongkan data slots agar tidak ada itemboard yang tampil
      });
      return;
    }

    // 2. Penanganan normal untuk board biasa
    if (!boards) return;
    const targetBoard = boards?.find((e) => e.board_id === selectedBoard);

    if (targetBoard) {
      const transformedBoard = {
        id: targetBoard.board_id,
        name: targetBoard.board_name,
        slots: targetBoard.ground_truth.map((cardId, index) => ({
          id: `slot-${index}`,
          value: CARDS.find((card) => card.id === cardId) || null,
        })),
      };

      setItemBoard(transformedBoard);
    }
  }, [selectedBoard, boards]);

  // Telemetry Pipeline: CPU Utilization Multicore Core Bars
  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_API}/ws/utilization`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCpuUtilization(data);
    };
    return () => {
      ws.close();
      ws.onerror = null;
      ws.onclose = null;
    };
  }, []);

  // Telemetry Pipeline: Hardware Thermal & Core Clock Speed Frequencies
  useEffect(() => {
    const wsStatus = new WebSocket(`${import.meta.env.VITE_API}/ws/metrics`);
    wsStatus.onerror = () => {};

    wsStatus.onclose = () => {};
    wsStatus.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCpuStatus(data);
    };
    return () => wsStatus.close();
  }, []);

  // Model Pipeline: Inference
  useEffect(() => {
    // 💡 TAHAN WEBSOCKET: Jangan konek jika streamMode bernilai 0 (Stop) atau null (Belum siap)
    if (streamMode === 0 || streamMode === null) {
      return;
    }

    const ws = new WebSocket(`${import.meta.env.VITE_API_AI}/ws/inference`);
    ws.onerror = () => {};

    ws.onclose = () => {};

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const rawFps = Number(data?.inference_fps) || 0;
        const rawForwardPass = Number(data?.forward_pass_ms) || 0;
        const evaluation = data?.evaluation;

        if (data?.camera_error !== null && data?.camera_error !== undefined) {
          setCameraError(data?.camera_error);
        }

        setInferenceFps(Number(rawFps.toFixed(2)));
        setForwardPass(Number(rawForwardPass.toFixed(2)));

        // Update data evaluasi dari websocket selama stream aktif
        if (evaluation) {
          setEvaluationData(evaluation);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = () => console.log("Disconnected from Inference WS");

    // Otomatis menutup websocket saat streamMode berubah jadi 0 / unmount
    return () => {
      ws.close();
    };
  }, [streamMode]); // Dep dependency disesuaikan dengan streamMode

  useEffect(() => {
    if (cameraError != "") {
      setStreamMode(null);
      setModalConfig({
        isOpen: true,
        type: "warning",
        title: "Camera Failed",
        message: cameraError,
        confirmText: "OK",
        cancelText: "",
        onConfirm: closeModal,
      });
      setCameraError("");
    }
  }, [cameraError]);

  // Handle Toggle Pipeline For Video Capture Frames Streaming
  useEffect(() => {
    const handleVideoToggle = async () => {
      setIsActionLoading(true);
      await withMinimumDelay(async () => {
        try {
          if (streamMode === 0) {
            await apiServices.stopVideo();
          }
          if (streamMode === 1) {
            await apiServices.startDetection({ calibration_points: calibrate });
          }
          if (streamMode === 2) {
            await apiServices.startCalibrate();
          }
        } catch (error) {
          setStreamMode(null);
          setModalConfig({
            isOpen: true,
            type: "warning",
            title: "Video Control Failed",
            message: error?.response?.data?.detail || error?.message || "Failed to start or stop the video.",
            confirmText: "OK",
            cancelText: "",
            onConfirm: closeModal,
          });
        }
      }, 400);
      setIsActionLoading(false);
    };

    if (streamMode == null) return;
    handleVideoToggle();

    return () => {
      apiServices.stopVideo();
    };
  }, [streamMode]);

  // Hardware Driver Interaction: Modify Video FPS Threshold
  const onChangeFPS = async (e) => {
    if (e === cameraFps) return;
    setIsActionLoading(true);

    await withMinimumDelay(async () => {
      try {
        const response = await apiServices.updateFps({ cameraFps: e });
        if (response?.status === "success") {
          dispatch({
            type: "CHANGE_FPS_CONFIG",
            payload: e,
          });
        }
      } catch (error) {
        setModalConfig({
          isOpen: true,
          type: "warning",
          title: "Update Failed",
          message: error?.response?.data?.detail || error?.message || "Failed to update FPS settings.",
          confirmText: "OK",
          cancelText: "",
          onConfirm: closeModal,
        });
      }
    }, 400);

    setIsActionLoading(false);
  };

  const onChangeModel = async (e) => {
    if (e === selectedModel) return;
    setIsActionLoading(true);

    await withMinimumDelay(async () => {
      try {
        const response = await apiServices.selectModel(e);
        const resData = response?.data || response;
        if (resData?.status === "success" || response?.status === 200) {
          dispatch({
            type: "CHANGE_SELECTED_MODEL",
            payload: e,
          });
        }
      } catch (error) {
        setModalConfig({
          isOpen: true,
          type: "warning",
          title: "Update Failed",
          message: error?.response?.data?.detail || error?.message || "Failed to change model.",
          confirmText: "OK",
          cancelText: "",
          onConfirm: closeModal,
        });
      }
    }, 400);

    setIsActionLoading(false);
  };

  const handleSaveFile = async () => {
    setIsActionLoading(true);

    await withMinimumDelay(async () => {
      try {
        const response = await apiServices.uploadModel(file);
        if (response?.status === "success") {
          setFile(null);
          try {
            apiServices.getModel().then((data) => {
              const resData = data?.data || data;
              dispatch({ type: "GET_MODELS", payload: resData?.models });
              dispatch({ type: "CHANGE_SELECTED_MODEL", payload: resData?.selected_model });
            });
          } catch (err) {
            setStreamMode(null);
            setModalConfig({
              isOpen: true,
              type: "warning",
              title: "Sync Failed",
              message: err?.message || "Failed to synchronize initial hardware or board data.",
              confirmText: "OK",
              cancelText: "",
              onConfirm: closeModal,
            });
          }
        }
      } catch (error) {
        setModalConfig({
          isOpen: true,
          type: "warning",
          title: "Upload Failed",
          message: error?.response?.data?.detail || error?.message || "Failed to upload file.",
          confirmText: "OK",
          cancelText: "",
          onConfirm: closeModal,
        });
      }
    }, 400);

    setIsActionLoading(false);
  };

  const selectedBoardObj = boards?.find((board) => board.board_id === selectedBoard);
  const selectedBoardName = selectedBoard === "NONE" ? "NONE" : selectedBoardObj ? selectedBoardObj.board_name : null;

  const onChangeGT = async (selectedBoardName) => {
    let boardId;
    setIsActionLoading(true);

    // Reset data evaluasi visual saat ganti board
    setEvaluationData([]);

    if (selectedBoardName === "NONE") {
      boardId = "NONE";
    } else {
      const selectedBoardObj = boards?.find((board) => board.board_name === selectedBoardName);
      if (!selectedBoardObj) return;
      boardId = selectedBoardObj.board_id;
    }

    if (boardId === selectedBoard) return;

    await withMinimumDelay(async () => {
      try {
        const response = await apiServices.activeGT(boardId);

        if (response?.status === "success" || response?.status === 200 || response?.ok) {
          setSelectedBoard(boardId); // 👈 Value tetap tersimpan
        }
      } catch (error) {
        setModalConfig({
          isOpen: true,
          type: "warning",
          title: "Update Failed",
          message: error?.response?.data?.detail || error?.message || "Failed to change active board.",
          confirmText: "OK",
          cancelText: "",
          onConfirm: closeModal,
        });
      }
    }, 400);

    setIsActionLoading(false);
  };

  // NEW FITUR TEST

  const [calibrate, setCalibrate] = useState(() => {
    try {
      const saved = localStorage.getItem("calibration_points");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Gagal memuat calibration points dari localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("calibration_points", JSON.stringify(calibrate));
    } catch (error) {
      console.error("Gagal menyimpan calibration points ke localStorage:", error);
    }
  }, [calibrate]);

  const handleAddCalibrationPoint = (newPoint) => {
    if (calibrate.length < 4) {
      const allPoints = [...calibrate, newPoint];
      if (allPoints.length === 4) {
        const sortedByX = [...allPoints].sort((a, b) => a.x - b.x);

        const leftPoints = sortedByX.slice(0, 2).sort((a, b) => a.y - b.y);
        const topLeft = leftPoints[0];
        const bottomLeft = leftPoints[1];

        const rightPoints = sortedByX.slice(2, 4).sort((a, b) => a.y - b.y);
        const topRight = rightPoints[0];
        const bottomRight = rightPoints[1];

        const sortedPoints = [topLeft, topRight, bottomRight, bottomLeft];
        setCalibrate(sortedPoints);
      } else {
        setCalibrate(allPoints);
      }
    }
  };

  const imgRef = useRef(null);
  const FRAME_WIDTH = 660;
  const FRAME_HEIGHT = 380;

  const handleCalibrationClick = async (e) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const scale = Math.min(rect.width / FRAME_WIDTH, rect.height / FRAME_HEIGHT);
    const renderedWidth = FRAME_WIDTH * scale;
    const renderedHeight = FRAME_HEIGHT * scale;

    // filter padding
    const offsetX = (rect.width - renderedWidth) / 2;
    const offsetY = (rect.height - renderedHeight) / 2;

    // koordinat relatif terhadap video
    // const x = e.clientX - rect.left - offsetX - 1.2;
    // const y = e.clientY - rect.top - offsetY - 10;

    const x = e.clientX - rect.left - offsetX + 8;
    const y = e.clientY - rect.top - offsetY;

    // klik di luar area gambar
    if (x < 0 || y < 0 || x > renderedWidth || y > renderedHeight) {
      return;
    }

    // konversi ke koordinat frame
    // const frameX = Math.round((x * FRAME_WIDTH) / renderedWidth);
    // const frameY = Math.round((y * FRAME_HEIGHT) / renderedHeight);

    handleAddCalibrationPoint({ x: x, y: y });
  };

  if (!!isInitialLoading)
    return (
      <div className="parent overflow-x-hidden">
        <h1 className="text-xtitle">Main Monitor</h1>
        <p className="text-subinfo mt-2 text-gray-500">Monitor camera streams along with model and CPU metrics.</p>
        <Skeleton />
      </div>
    );

  return (
    <div className="parent overflow-x-hidden">
      <h1 className="text-xtitle">Main Monitor</h1>
      <p className="text-subinfo mt-2 text-gray-500">Monitor camera streams along with model and CPU metrics.</p>

      {/* Main Streaming  */}
      <div className="flex flex-col lg:flex-row w-full justify-between mt-4 gap-4">
        <div className="flex flex-col flex-1 w-full min-w-0">
          {/* CHILD  */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap mb-4 gap-4 justify-between items-start">
              <div className="flex flex-row gap-2 w-full sm:w-auto items-center">
                <Dropdown disabled={streamMode === 2 || streamMode === 1} width="w-full sm:w-50" value={selectedModel} onChange={onChangeModel} options={models} type="model" />
                <FileInput disabled={streamMode != 0} className="w-full xl:w-auto" accept=".tflite" maxSizeMB={50} onChange={(selectedFile) => setFile(selectedFile)} onError={handleFileError} handleSave={handleSaveFile} />
              </div>
              <Dropdown disabled={streamMode === 2} value={cameraFps} onChange={(e) => onChangeFPS(e)} valueLabel="FPS Camera" options={[30, 25, 20, 15, 10, 5]} />
            </div>

            {/* Monitoring Section */}
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div className="flex flex-col gap-4 flex-1 w-full min-w-0">
                <div className="bg-white border border-blue-100 shadow-sm rounded-xl p-4 max-w-xs">
                  <div className="grid grid-cols-3 gap-2 items-stretch">
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      {Array.from({ length: 4 }).map((_, i) => {
                        const e = calibrate[i];
                        const hasValue = e && e.x !== undefined && e.y !== undefined;
                        return (
                          <div key={i} className={`flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${hasValue ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-50 text-slate-400 border border-dashed border-slate-200"}`}>
                            <span className="truncate w-15">{hasValue ? `${e.x}, ${e.y}` : `NULL`}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      style={{ cursor: streamMode === 1 ? "not-allowed" : "pointer" }}
                      disabled={streamMode === 1}
                      className="w-full py-2 px-3 rounded-lg text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                      onClick={() => {
                        setCalibrate([]);
                      }}
                    >
                      CLEAR
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="card-stream w-full h-fit flex items-center justify-center overflow-hidden">
                    {streamMode ? (
                      <div style={{ position: "relative" }}>
                        <img ref={imgRef} src={videoUrl} alt="Live Video Feed" className="w-full min-h-[250px] sm:min-h-[365px] object-contain bg-black rounded-lg cursor-crosshair" onClick={handleCalibrationClick} />
                        {calibrate.map((point, index) => (
                          <div
                            key={index}
                            style={{
                              position: "absolute",
                              left: `${point.x}px`,
                              top: `${point.y}px`,
                              transform: "translate(-50%, -50%)",
                              width: "15px",
                              height: "15px",
                              backgroundColor: "#1e3a8a",
                              borderRadius: "50%",
                              pointerEvents: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "10px",
                              fontWeight: "bold",
                            }}
                          >
                            {index + 1}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="min-h-[250px] sm:min-h-[365px] w-full bg-black rounded-lg flex items-center justify-center p-4">
                        <p className="text-white text-2xl sm:text-4xl text-center">
                          DETECTION <br />
                          STOPPED
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Button */}
                <div className="flex justify-between gap-4 items-end">
                  <button
                    style={{ cursor: (streamMode === 2 && calibrate.length < 4) || streamMode === 1 ? "not-allowed" : "pointer" }}
                    disabled={(streamMode === 2 && calibrate.length < 4) || streamMode === 1}
                    className={`text-white px-4 py-2 rounded-lg flex items-center justify-center w-full text-lg sm:text-xl disabled:opacity-50 ${calibrate.length === 4 ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-900"}`}
                    onClick={() => {
                      if (calibrate.length === 4) {
                        setStreamMode(1);
                      } else {
                        setStreamMode(2);
                      }
                      setEvaluationData([]);
                    }}
                  >
                    <p>{calibrate.length === 4 ? "D E T E C T I O N" : "C A L I B R A T E"}</p>
                  </button>
                  <button
                    style={{ cursor: streamMode === 0 || streamMode === null ? "not-allowed" : "pointer" }}
                    disabled={streamMode === 0 || streamMode === null}
                    className="btn bg-[var(--danger)] text-white px-4 py-2 rounded-lg flex items-center justify-center w-full text-lg sm:text-xl disabled:opacity-50 hover:bg-[#8b2536]"
                    onClick={() => {
                      setStreamMode(0);
                    }}
                  >
                    <p>S T O P</p>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 flex-none min-w-0 md:flex-none">
                <Dropdown disabled={streamMode === 2} width="mt-0 lg:mt-14 w-40 self-end" value={selectedBoardName} options={["NONE", ...(boards?.map((e) => e.board_name) || [])]} onChange={onChangeGT} />

                {selectedBoard ? (
                  <div className="border border-slate-200 p-3 sm:p-5 flex justify-center bg-blue-300 rounded-lg h-auto sm:h-[400px] items-center overflow-x-auto w-full">
                    <div className="grid grid-cols-3 sm:grid-cols-5 items-center gap-x-2 sm:gap-x-4 gap-y-2 justify-items-center w-full h-full p-3 sm:p-6 bg-white rounded-lg shadow-lg">
                      {(itemBoard?.slots?.length > 0 ? itemBoard.slots : Array.from({ length: 15 }, (_, index) => ({ value: null }))).map((card, i) => {
                        return card?.value ? (
                          <div key={i}>
                            <div className="relative group flex justify-center items-center">
                              <img src={card?.value?.img} alt="Ground" className="w-7 h-15 object-contain cursor-pointer transition-transform hover:scale-105" />
                              {card?.value?.id && <span className="absolute bottom-full mb-1 hidden group-hover:flex items-center justify-center px-2 py-1 text-sm font-mono font-semibold text-white bg-gray-900/90 rounded shadow-md whitespace-nowrap z-20 pointer-events-none transition-all">{card.value.id}</span>}
                            </div>
                            <p className="text-center text-xs sm:text-sm text-blue-700">{`${i + 1}`}</p>
                          </div>
                        ) : (
                          <div key={i}>
                            <div className="w-7 h-15 bg-gray-100 rounded-sm border border-dashed border-gray-300" />
                            <p className="text-center text-xs sm:text-sm text-gray-500">{`${i + 1}`}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>

            {/* Asumsi `evaluationData` adalah objek JSON dari WebSocket/State */}
            {/* Contoh pembacaan: const evaluationData = dataWs?.evaluation; */}

            {/* GROUND TRUTH LIST */}
            <div className="relative w-full overflow-hidden rounded-lg border border-gray-800 p-4 bg-white">
              {/* Container scroll pembungkus utama */}
              <div className="max-h-64 overflow-y-auto pr-3 scrollbar scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-6">
                  {/* Detection Column */}
                  <div className="flex-1 flex flex-col gap-2">
                    <h4 className="text-info border-b border-gray-800 pb-2" style={{ color: "#15803d", fontWeight: "bold" }}>
                      D E T E C T I O N
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-subinfo text-xs marker:font-bold marker:text-green-700">
                      {evaluationData?.slot_details?.map((slot) => {
                        const textColorClass = slot.is_correct === true ? "text-green-600" : slot.is_correct === false ? "text-red-600" : "text-gray-700";
                        return (
                          <li key={slot.slot} className={`p-1.5 rounded hover:bg-gray-100 font-mono transition ${textColorClass}`}>
                            {slot.detection ?? "-"}
                            <span className="opacity-75 text-[10px] ml-1">({(slot.confidence * 100).toFixed(2)}%)</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full sm:h-auto sm:w-px bg-gray-200 self-stretch" />

                  {/* Ground Truth Column */}
                  <div className="flex-1 flex flex-col gap-2">
                    <h4 className="text-info border-b border-gray-800 pb-2" style={{ color: "#3b82f6", fontWeight: "bold" }}>
                      G R O U N D &nbsp; T R U T H
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-subinfo text-xs marker:font-bold marker:text-blue-700">
                      {evaluationData?.slot_details?.map((slot) => (
                        <li key={slot.slot} className="p-1.5 rounded hover:bg-gray-100 font-mono transition">
                          {slot.ground_truth ?? "-"}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full sm:h-auto sm:w-px bg-gray-200 self-stretch" />

                  {/* Status Column */}
                  <div className="flex-1 flex flex-col gap-2">
                    <h4 className="text-info border-b border-gray-800 pb-2" style={{ color: "black", fontWeight: "bold" }}>
                      S T A T U S
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-subinfo text-xs marker:font-bold marker:text-black">
                      {evaluationData?.slot_details?.map((slot) => (
                        <li key={slot.slot} className="p-1.5 rounded hover:bg-gray-100 font-mono transition">
                          {slot.is_correct !== null && slot.is_correct !== undefined ? <span className={`font-bold ${slot.is_correct ? "text-green-600" : "text-red-600"}`}>{slot.is_correct ? "CORRECT" : "WRONG"}</span> : <span className="text-gray-400">-</span>}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Accuracy Metrics & Instance Performance */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
              <div className="card flex-1">
                <p className="text-title" style={{ color: "grey" }}>
                  Metrics
                </p>
                <div className="flex justify-between mt-2 gap-2 sm:gap-5">
                  <div className="flex flex-col gap-1">
                    <p className="text-info">Detection Rate:</p>
                    <p className="text-info">Avg. Confidence Score:</p>
                    <p className="text-info">Precision:</p>
                  </div>
                  <div className="flex flex-col gap-1 text-right sm:text-left font-mono">
                    <p className="text-info">{evaluationData?.metrics?.detection_rate != null ? `${Number(evaluationData.metrics.detection_rate).toFixed(2)}%` : "-"}</p>
                    <p className="text-info">{evaluationData?.metrics?.avg_confidence != null ? `${(Number(evaluationData.metrics.avg_confidence) * 100).toFixed(2)}%` : "-"}</p>
                    <p className="text-info">{evaluationData?.metrics?.precision != null ? `${Number(evaluationData.metrics.precision).toFixed(2)}%` : "-"}</p>
                  </div>
                </div>
              </div>

              <div className="card flex-1">
                <p className="text-title" style={{ color: "grey" }}>
                  Instance Performance
                </p>
                <div className="flex mt-2 gap-2 sm:gap-5 justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-info">Forward-pass:</p>
                    <p className="text-info">Inference FPS:</p>
                  </div>
                  <div className="flex flex-col gap-1 text-right sm:text-left font-mono">
                    <p className="text-info">{forwardPass != null ? `${Number(forwardPass).toFixed(2)} ms` : "-"}</p>
                    <p className="text-info">{inferenceFps != null ? `${Number(inferenceFps).toFixed(2)} FPS` : "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* INFO - CPU Utilization */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 w-full">
              <div className="flex-1 w-full min-w-0">
                <div className="card w-full h-full rounded-lg shadow-md gap-4">
                  <p className="text-title" style={{ color: "grey" }}>
                    CPU Utilization
                  </p>
                  <p className="text-info mb-4 mt-2">Average: {cpuUtilization?.average}%</p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-4">
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.core[0]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 0</span>
                        <span className="text-subinfo">{cpuUtilization?.core[0]}%</span>
                      </div>
                    </div>
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.core[2]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 2</span>
                        <span className="text-subinfo">{cpuUtilization?.core[2]}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.core[1]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 1</span>
                        <span className="text-subinfo">{cpuUtilization?.core[1]}%</span>
                      </div>
                    </div>
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.core[3]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 3</span>
                        <span className="text-subinfo">{cpuUtilization?.core[3]}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CPU Status & Config */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="card flex-1">
                <p className="text-title" style={{ color: "grey" }}>
                  CPU Status
                </p>
                <div className="flex justify-between mt-2 gap-2 sm:gap-5">
                  <div className="flex flex-col gap-1">
                    <p className="text-info">Current Frequency:</p>
                    <p className="text-info">Temperature:</p>
                  </div>
                  <div className="flex flex-col gap-1 text-right sm:text-left">
                    <p className="text-info">{cpuStatus?.frequency}</p>
                    <p className="text-info">{cpuStatus?.temperature} °C</p>
                  </div>
                </div>
              </div>

              <div className="card flex-1">
                <div className="flex justify-between gap-2 sm:gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-subinfo">CPU Governor:</p>
                    <p className="text-subinfo">Thread Allocation:</p>
                    <p className="text-subinfo">Core Pinning:</p>
                  </div>
                  <div className="flex flex-col gap-1 text-right sm:text-left">
                    <p className="text-subinfo uppercase" style={{ fontWeight: "bold" }}>
                      {cpu?.governor}
                    </p>
                    <p className="text-subinfo" style={{ fontWeight: "bold" }}>
                      {cpu?.thread}
                    </p>
                    <p className="text-subinfo" style={{ fontWeight: "bold" }}>
                      {cpu?.core?.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!!isActionLoading ? <ActionLoading /> : <ModalAlert isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} message={modalConfig.message} confirmText={modalConfig.confirmText} cancelText={modalConfig.cancelText} onClose={closeModal} onConfirm={modalConfig.onConfirm} />}
    </div>
  );
}
