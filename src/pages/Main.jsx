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

// 5. Assets, Images & Constants
import Play from "../assets/play.svg";
import Stop from "../assets/stop.svg";
import CARDS from "../components/Cards";

export default function Main() {
  // Custom Hooks Configuration Context
  const { cpu, dispatch } = useCPU();
  const { boards } = useGround();

  // Static API Endpoints
  const videoUrl = `${import.meta.env.VITE_API_AI}/video`;

  // Global Page Loading States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Real-time CPU Performance Metrics
  const [cpuUtilization, setCpuUtilization] = useState({
    average: 0,
    cores: [0, 0, 0, 0],
  });
  const [cpuStatus, setCpuStatus] = useState({
    frequency: "0.0 GHz",
    temperature: 0.0,
  });

  // Object Detection Model & Camera Framing
  const [model, setModel] = useState("SSD MobileNet V3 Small");
  const [cameraFps, setCameraFps] = useState(cpu?.fpsCamera);
  const [streamMode, setStreamMode] = useState(null); // 0: Stop, 1: Start
  const [inferenceFps, setInferenceFps] = useState({ realtime: 0, avg: 0 });
  const [forwardPass, setForwardPass] = useState({ realtime: 0, avg: 0 });

  // Kontrol Average
  const [isRecording, setIsRecording] = useState(false);
  const [targetSamples, setTargetSamples] = useState(100); // Default 100
  const [avgProgress, setAvgProgress] = useState(0);

  // Ref Buffer & Throttle
  const fpsBufferRef = useRef([]);
  const forwardPassBufferRef = useRef([]);
  const lastUpdateRef = useRef(0);

  // Ref
  const isRecordingRef = useRef(isRecording);
  const targetSamplesRef = useRef(targetSamples);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    targetSamplesRef.current = targetSamples;
  }, [targetSamples]);

  // Heeelper Average
  const getAverage = (buffer, newValue, maxWindow) => {
    buffer.push(newValue);
    if (buffer.length > maxWindow) {
      buffer.shift();
    }
    const sum = buffer.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / buffer.length).toFixed(2));
  };

  // Clear/Reset Data Average
  const handleClear = () => {
    fpsBufferRef.current = [];
    forwardPassBufferRef.current = [];
    // setIsRecording(false);
    setAvgProgress(0);
    setInferenceFps((prev) => ({ ...prev, avg: 0 }));
    setForwardPass((prev) => ({ ...prev, avg: 0 }));
  };

  // Ground Truth Evaluation Board Targets
  const [itemBoard, setItemBoard] = useState({});
  const [selectedBoard, setSelectedBoard] = useState(boards ? boards[0]?.board_name : null);

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

  // Fetch Hardware State & Stream Status on Page Mount
  useEffect(() => {
    setIsInitialLoading(true);

    const fetchInitialData = async () => {
      const startTime = Date.now();
      const MINIMUM_DELAY = 500; // Minimal display loading padding (0.5 detik)

      try {
        await Promise.all([
          apiServices.getGovernorStatus().then((data) => {
            dispatch({ type: "CHANGE_GOVERNOR", payload: data.governor });
          }),
          apiServices.getThread().then((data) => {
            dispatch({
              type: "CHANGE_THREAD_CONFIG",
              payload: data?.num_threads,
            });
          }),
          apiServices.getCores().then((data) => {
            dispatch({ type: "CHANGE_CORE_CONFIG", payload: data?.cores });
          }),
          apiServices.getFps().then((data) => {
            dispatch({ type: "CHANGE_FPS_CONFIG", payload: data?.fps_camera });
          }),
          apiServices.stopVideo().then((data) => {
            if (data?.stream_status === "start") setStreamMode(1);
            if (data?.stream_status === "stop") {
              (setStreamMode(0), setIsRecording(false));
            }
          }),
        ]);
      } catch (err) {
        console.log(err);
        setStreamMode(null);
        setIsRecording(false)
        setModalConfig({
          isOpen: true,
          type: "warning",
          title: "Sync Failed",
          message: err?.response?.data?.detail || err?.message || "Failed to synchronize initial hardware data.",
          confirmText: "OK",
          cancelText: "",
          onConfirm: closeModal,
        });
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MINIMUM_DELAY - elapsedTime);
        setTimeout(() => {
          setIsInitialLoading(false);
        }, remainingTime);
      }
    };

    fetchInitialData();
  }, [dispatch]);

  // Keep Sync Camera FPS inside Local Draft State with CPU Context Updates
  useEffect(() => {
    setCameraFps(cpu?.fpsCamera);
  }, [cpu?.fpsCamera]);

  // Match Selected Evaluation Board with Local Reference JSON Data
  useEffect(() => {
    if (!boards || !selectedBoard) return;
    const targetBoard = boards?.find((e) => e.board_name === selectedBoard);

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
    ws.onopen = () => console.log("Connected to Utilization WS");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCpuUtilization(data);
    };
    ws.onclose = () => console.log("Disconnected from Utilization WS");
    return () => ws.close();
  }, []);

  // Telemetry Pipeline: Hardware Thermal & Core Clock Speed Frequencies
  useEffect(() => {
    const wsStatus = new WebSocket(`${import.meta.env.VITE_API}/ws/metrics`);
    wsStatus.onopen = () => console.log("Connected to Status WS");
    wsStatus.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCpuStatus(data);
    };
    wsStatus.onclose = () => console.log("Disconnected from Status WS");
    return () => wsStatus.close();
  }, []);

  // Model Pipeline: Inference
  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_API_AI}/ws/inference`);
    ws.onopen = () => console.log("Connected to Inference WS");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const rawFps = Number(data?.inference_fps) || 0;
        const rawForwardPass = Number(data?.forward_pass_ms) || 0;

        // 1. ISI BUFFER DENGAN SLIDING WINDOW (Gunakan Shift jika penuh)
        if (isRecordingRef.current) {
          const maxSamples = targetSamplesRef.current;

          // Tambahkan data baru
          fpsBufferRef.current.push(rawFps);
          forwardPassBufferRef.current.push(rawForwardPass);

          // Jika jumlah data melebihi maxSamples, BUANG data paling lama (Sliding)
          if (fpsBufferRef.current.length > maxSamples) {
            fpsBufferRef.current.shift();
            forwardPassBufferRef.current.shift();
          }
        }

        // 2. THROTTLE UPDATE UI
        const now = Date.now();
        if (now - lastUpdateRef.current >= 300) {
          lastUpdateRef.current = now;

          const currentCount = fpsBufferRef.current.length;
          const maxSamples = targetSamplesRef.current;

          // Hitung progress ketercukupan sampel (mentok di 100%)
          const calculatedProgress = maxSamples > 0 ? Math.min(Math.round((currentCount / maxSamples) * 100), 100) : 0;

          // Hitung rata-rata dari N data TERAKHIR yang ada di buffer
          const avgFps = currentCount > 0 ? Number((fpsBufferRef.current.reduce((a, b) => a + b, 0) / currentCount).toFixed(2)) : 0;
          const avgForwardPass = currentCount > 0 ? Number((forwardPassBufferRef.current.reduce((a, b) => a + b, 0) / currentCount).toFixed(2)) : 0;

          setAvgProgress(calculatedProgress);

          if (isRecordingRef.current) {
            setInferenceFps({
              realtime: Number(rawFps.toFixed(2)),
              avg: avgFps,
            });
            setForwardPass({
              realtime: Number(rawForwardPass.toFixed(2)),
              avg: avgForwardPass,
            });
          } else {
            // Jika Pause, pertahankan nilai avg terakhir
            setInferenceFps((prev) => ({ ...prev, realtime: Number(rawFps.toFixed(2)) }));
            setForwardPass((prev) => ({ ...prev, realtime: Number(rawForwardPass.toFixed(2)) }));
          }
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = () => console.log("Disconnected from Inference WS");
    return () => {
      ws.close();
    };
  }, []);

  // Handle Toggle Pipeline For Video Capture Frames Streaming
  useEffect(() => {
    const handleVideoToggle = async () => {
      setIsActionLoading(true);
      const startTime = Date.now();
      const MINIMUM_DELAY = 400;

      try {
        if (streamMode) {
          await apiServices.startVideo();
        } else {
          await apiServices.stopVideo();
        }
      } catch (error) {
        setIsRecording(false)
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
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MINIMUM_DELAY - elapsedTime);
        setTimeout(() => {
          setIsActionLoading(false);
        }, remainingTime);
      }
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
    const startTime = Date.now();
    const MINIMUM_DELAY = 400;

    try {
      const response = await apiServices.updateFps({ cameraFps: e });
      console.log(response);
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
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MINIMUM_DELAY - elapsedTime);
      setTimeout(() => {
        setIsActionLoading(false);
      }, remainingTime);
    }
  };

  if (!!isInitialLoading)
    return (
      <div className="parent">
        <h1 className="text-xtitle">Main Monitor</h1>
        <p className="text-subinfo mt-2 text-gray-500">Monitor camera streams along with model and CPU metrics.</p>
        <Skeleton />
      </div>
    );

  return (
    <div className="parent">
      <h1 className="text-xtitle">Main Monitor</h1>
      <p className="text-subinfo mt-2 text-gray-500">Monitor camera streams along with model and CPU metrics.</p>

      {/* Main Streaming  */}

      <div className="flex flex-col lg:flex-row  max-w-screen justify-between mt-4 gap-4">
        {/* STREAMING  */}
        <div className="flex flex-col flex-1">
          <div className="flex flex-col lg:flex-row justify-between mb-4 gap-4">
            {/* Model & FPS  */}
            <Dropdown width="w-65" value={model} onChange={setModel} options={["SSD MobileNet V3 Small", "SSD MobileNet V3 Large"]} disabled={streamMode === 1} />
            <Dropdown width="w-50" value={cameraFps} onChange={(e) => onChangeFPS(e)} valueLabel="FPS Camera" options={[30, 25, 20, 15, 10, 5]} />
          </div>

          {/* CHILD  */}

          <div className="flex flex-col gap-6">
            {/* Streaming Camera */}
            <div className="card-stream w-full h-fit flex items-center justify-center">
              {streamMode ? (
                <img src={videoUrl} alt="Live Video Feed" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="h-[376.5px] w-full object-contain bg-black rounded-lg flex items-center justify-center">
                  <p className="text-white text-4xl text-center">
                    DETECTION <br />
                    STOPPED
                  </p>
                </div>
              )}
            </div>

            {/* Button */}
            <div className="flex justify-between gap-4 items-end">
              <button style={{ cursor: streamMode === 1 ? "not-allowed" : "pointer" }} disabled={streamMode === 1} className="btn-primary text-white px-4 py-2 rounded-lg flex items-center justify-center w-full text-xl disabled:opacity-50 hover:bg-[var(--primary-hover)]" onClick={() => setStreamMode(1)}>
                <img src={Play} alt="Play" className="w-7 h-7 mr-1 inline-block" />
                <p>Start</p>
              </button>
              <button
                style={{ cursor: streamMode === 0 || streamMode === null ? "not-allowed" : "pointer" }}
                disabled={streamMode === 0 || streamMode === null}
                className="btn bg-[var(--danger)] text-white px-4 py-2 rounded-lg flex items-center justify-center w-full text-xl disabled:opacity-50 hover:bg-[#8b2536]"
                onClick={() => {
                  (setStreamMode(0), setIsRecording(false));
                }}
              >
                <img src={Stop} alt="Stop" className="w-7 h-7 mr-2 inline-block" />
                <p>Stop</p>
              </button>
            </div>

            {/* INFO  */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 max-w-screen">
              <div className="flex-1">
                {/* CPU Utilization */}
                <div className="card w-full h-full rounded-lg shadow-md gap-4">
                  <p className="text-title">CPU Utilization</p>
                  <p className="text-info mb-4 mt-2">Average: {cpuUtilization?.average}%</p>
                  <div className="flex gap-8 mb-4">
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.cores[0]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 0</span>
                        <span className="text-subinfo">{cpuUtilization?.cores[0]}%</span>
                      </div>
                    </div>
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.cores[2]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 2</span>
                        <span className="text-subinfo">{cpuUtilization?.cores[2]}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.cores[1]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 1</span>
                        <span className="text-subinfo">{cpuUtilization?.cores[1]}%</span>
                      </div>
                    </div>
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.cores[3]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 3</span>
                        <span className="text-subinfo">{cpuUtilization?.cores[3]}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACCURACY METRICS  */}
        <div className="flex-none flex flex-col">
          <div className="flex justify-end">
            <Dropdown width="w-40" value={selectedBoard || null} options={boards?.map((e) => e.board_name) || []} onChange={(e) => setSelectedBoard(e)} />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            {selectedBoard ? (
              <div className="border border-slate-200 p-5 flex justify-center bg-blue-300 rounded-lg pt-10 pb-10">
                <div className="grid grid-cols-5 items-center gap-4 justify-items-center w-fit p-6 bg-white rounded-lg shadow-lg">
                  {itemBoard?.slots?.map((card, i) => {
                    return card?.value ? (
                      <img key={i} src={card?.value?.img} alt="Ground" className="w-7 h-15 object-contain" />
                    ) : (
                      /* Tampilkan kotak kosong kecil yang ukurannya sama (w-7 h-15) */
                      <div key={i} className="w-7 h-15 bg-gray-100 rounded-sm border border-dashed border-gray-300" />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div />
            )}

            <div className="card">
              <p className="text-title">Accuracy Metrics</p>
              <div className="flex mt-2 gap-5">
                <div className="flex flex-col gap-1">
                  <p className="text-info">Detection Rate:</p>
                  <p className="text-info">Avg. Confidence Score:</p>
                  <p className="text-info">Average Precision:</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-info">80%</p>
                  <p className="text-info">50%</p>
                  <p className="text-info">90%</p>
                </div>
              </div>
            </div>
            <div className="card">
              <p className="text-title">Real-time Data</p>
              <div className="flex mt-2 gap-5">
                <div className="flex flex-col gap-1">
                  <p className="text-info">Forward-pass:</p>
                  <p className="text-info">Inference FPS:</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-info">{forwardPass?.realtime} ms</p>
                  <p className="text-info">{inferenceFps?.realtime} ms</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-2">
                <p className="text-title">Average </p>
                <TextInput disabled={isRecording} width="w-15" type="number" min="1" max="1000" value={targetSamples} onChange={(e) => setTargetSamples(Math.max(1, Number(e.target.value)))} className="text-center" />
                <p className="text-title">Data</p>
              </div>
              <div className="flex mt-2 gap-5">
                <div className="flex flex-col gap-1">
                  <p className="text-info">Forward-pass:</p>
                  <p className="text-info">Inference FPS:</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-info">{forwardPass.avg} ms</p>
                  <p className="text-info">{inferenceFps?.avg} ms</p>
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <span>Sample Completeness: {avgProgress}%</span>
                <ProgressBar value={avgProgress} type="avg" />
                <div className="flex items-center gap-2">
                  <button disabled={streamMode == 0 || streamMode == null} onClick={() => setIsRecording(!isRecording)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-300 ${isRecording ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                    {isRecording ? "Pause" : "Count"}
                  </button>
                  <button disabled={streamMode == 0 || streamMode == null} type="button" onClick={handleClear} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-100">
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* CPU STATUS  */}
            <div className="flex-none flex flex-col min-w-75">
              <div className="flex flex-auto flex-col gap-2">
                <div className="card">
                  <p className="text-title">CPU Status</p>
                  <div className="flex mt-2 gap-5">
                    <div className="flex flex-col gap-1">
                      <p className="text-info">Current Frequency:</p>
                      <p className="text-info">Temperature:</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-info">{cpuStatus?.frequency}</p>
                      <p className="text-info">{cpuStatus?.temperature} °C</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-subinfo">CPU Governor:</p>
                      <p className="text-subinfo">Thread Allocation:</p>
                      <p className="text-subinfo">Core Pinning:</p>
                    </div>
                    <div className="flex flex-col gap-1">
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
      </div>
      {!!isActionLoading ? <ActionLoading /> : <ModalAlert isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} message={modalConfig.message} confirmText={modalConfig.confirmText} cancelText={modalConfig.cancelText} onClose={closeModal} onConfirm={modalConfig.onConfirm} />}
    </div>
  );
}
