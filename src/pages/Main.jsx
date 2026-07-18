import { useState, useEffect } from "react";
import Play from "../assets/play.svg";
import Stop from "../assets/stop.svg";
import ProgressBar from "../components/ProgressBar";
import Dropdown from "../components/Dropdown";

// State Management
import useCPU from "../hooks/useCPU";
import useGround from "../hooks/useGround";

import TextInput from "../components/TextInput";

// CARDS IMAGES
import CARDS from "../components/Cards";

import { cpuService } from "../services/cpuServices";

export default function Main() {
  const { cpu, dispatch } = useCPU();
  const { boards } = useGround();
  const videoUrl = `${import.meta.env.VITE_API_AI}/video`;

  const [cpuUtilization, setCpuUtilization] = useState({
    average: 0,
    cores: [0, 0, 0, 0],
  });
  const [cpuStatus, setCpuStatus] = useState({
    frequency: "0.0 GHz",
    temperature: 0.0,
  });

  const [model, setModel] = useState("SSD MobileNet V3 Small");
  const [fps, setFps] = useState(cpu?.fpsCamera);
  const [streamMode, setStreamMode] = useState(0); // 0: Stop, 1: Start

  // BOARD

  const [itemBoard, setItemBoard] = useState({});
  const [selectedBoard, setSelectedBoard] = useState(boards[0]?.board_name);

  // MATCH ITEM BOARD TER-SELECT DENGAN GAMBAR

  useEffect(() => {
    if (!boards || !selectedBoard) return;
    const targetBoard = boards.find((e) => e.board_name === selectedBoard);

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
  }, [selectedBoard]);

  // WEBSOCKET -  CPU UTILICATION BAR

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

  // START - STOP STREAM

  useEffect(() => {
    const handleVideoToggle = async () => {
      if (streamMode) {
        try {
          await cpuService.startVideo();
        } catch (error) {
          console.error("Gagal menjalankan video:", error);
        }
      } else {
        try {
          await cpuService.stopVideo();
        } catch (error) {
          console.error("Gagal menjalankan video:", error);
        }
      }
    };

    handleVideoToggle();

    return () => {
      cpuService.stopVideo();
    };
  }, [streamMode]);

  // KONDISI AWAL STREAM

  useEffect(() => {
    const handleInfoStream = async () => {
      try {
        const data = await cpuService.stopVideo();
        if (data?.stream_status == "start") {
          setStreamMode(1);
        }
        if (data?.stream_status == "stop") {
          setStreamMode(0);
        }
      } catch (error) {
        console.error("Gagal menjalankan video:", error);
      }
    };

    handleInfoStream();
  }, []);

  // GET DATA AWAL

  useEffect(() => {
    cpuService
      .getGovernorStatus()
      .then((data) => {
        dispatch({
          type: "CHANGE_GOVERNOR",
          payload: data.governor,
        });
      })
      .catch((err) => {
        console.error("Gagal sinkronisasi dengan hardware Linux:", err);
      });

    cpuService
      .getThread()
      .then((data) => {
        dispatch({
          type: "CHANGE_THREAD_CONFIG",
          payload: data?.num_threads,
        });
      })
      .catch((err) => {
        console.error("Gagal sinkronisasi THREAD hardware Linux:", err);
      });

    cpuService
      .getCores()
      .then((data) => {
        dispatch({
          type: "CHANGE_CORE_CONFIG",
          payload: data?.cores,
        });
      })
      .catch((err) => {
        console.error("Gagal sinkronisasi CORE hardware Linux:", err);
      });

    cpuService
      .getFps()
      .then((data) => {
        dispatch({
          type: "CHANGE_FPS_CONFIG",
          payload: data?.fps_camera,
        });
      })
      .catch((err) => {
        console.error("Gagal sinkronisasi FPS hardware Linux:", err);
      });
  }, [dispatch]);

  // GET FPS CAMERA

  useEffect(() => {
    setFps(cpu?.fpsCamera);
  }, [cpu?.fpsCamera]);

  // CHANGE FPS

  const onChangeFPS = async (e) => {
    if (e === fps) return;
    const response = await cpuService.updateFps({
      fps: e,
    });
    if (response?.status != "success") return;
    dispatch({
      type: "CHANGE_FPS_CONFIG",
      payload: e,
    });
  };

  return (
    <div className="parent">
      <h1 className="text-xtitle">Main Monitor</h1>
      <p className="text-subinfo mt-2 text-gray-500">
        Monitor camera streams along with model and CPU metrics.
      </p>

      {/* Main Streaming  */}

      <div className="flex flex-col lg:flex-row  max-w-screen justify-between mt-4 gap-4">
        {/* STREAMING  */}
        <div className="flex flex-col flex-1">
          <div className="flex flex-col lg:flex-row justify-between mb-4 gap-4">
            {/* Model & FPS  */}
            <Dropdown
              width="w-65"
              value={model}
              onChange={setModel}
              options={["SSD MobileNet V3 Small", "SSD MobileNet V3 Large"]}
              disabled={streamMode === 1}
            />
            <Dropdown
              width="w-30"
              value={fps}
              onChange={(e) => onChangeFPS(e)}
              valueLabel="FPS"
              options={[30, 25, 20, 15, 10, 5]}
            />
          </div>

          {/* CHILD  */}

          <div className="flex flex-col gap-6">
            {/* Streaming Camera */}
            <div className="card-stream w-full h-fit flex items-center justify-center">
              {streamMode ? (
                <img
                  src={videoUrl}
                  alt="Live Video Feed"
                  className="w-full h-full object-contain rounded-lg"
                />
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
              <button
                style={{ cursor: streamMode === 1 ? "not-allowed" : "pointer" }}
                disabled={streamMode === 1}
                className="btn-primary text-white px-4 py-2 rounded-lg flex items-center justify-center w-full text-xl disabled:opacity-50 hover:bg-[var(--primary-hover)]"
                onClick={() => setStreamMode(1)}
              >
                <img
                  src={Play}
                  alt="Play"
                  className="w-7 h-7 mr-1 inline-block"
                />
                <p>Start</p>
              </button>
              <button
                style={{ cursor: streamMode === 0 ? "not-allowed" : "pointer" }}
                disabled={streamMode === 0}
                className="btn bg-[var(--danger)] text-white px-4 py-2 rounded-lg flex items-center justify-center w-full text-xl disabled:opacity-50 hover:bg-[#8b2536]"
                onClick={() => setStreamMode(0)}
              >
                <img
                  src={Stop}
                  alt="Stop"
                  className="w-7 h-7 mr-2 inline-block"
                />
                <p>Stop</p>
              </button>
            </div>

            {/* INFO  */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 max-w-screen">
              <div className="flex-1">
                {/* CPU Utilization */}
                <div className="card w-full h-full rounded-lg shadow-md gap-4">
                  <p className="text-title">CPU Utilization</p>
                  <p className="text-info mb-4 mt-2">
                    Average: {cpuUtilization?.average}%
                  </p>
                  <div className="flex gap-8 mb-4">
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.cores[0]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 0</span>
                        <span className="text-subinfo">
                          {cpuUtilization?.cores[0]}%
                        </span>
                      </div>
                    </div>
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.cores[2]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 2</span>
                        <span className="text-subinfo">
                          {cpuUtilization?.cores[2]}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.cores[1]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 1</span>
                        <span className="text-subinfo">
                          {cpuUtilization?.cores[1]}%
                        </span>
                      </div>
                    </div>
                    <div className="gap-2 w-full">
                      <ProgressBar value={cpuUtilization?.cores[3]} />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-subinfo">Core 3</span>
                        <span className="text-subinfo">
                          {cpuUtilization?.cores[3]}%
                        </span>
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
            <Dropdown
              width="w-40"
              value={selectedBoard || "-"}
              options={boards?.map((e) => e.board_name)}
              onChange={(e) => setSelectedBoard(e)}
            />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            {!!selectedBoard && (
              <div className="border border-slate-200 p-5 flex justify-center bg-blue-300 rounded-lg pt-10 pb-10">
                <div className="grid grid-cols-4 items-center gap-4 justify-items-center w-fit p-6 bg-white rounded-lg shadow-lg">
                  {itemBoard?.slots?.map((card, i) => {
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
                    );
                  })}
                </div>
              </div>
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
              <p className="text-title">Forward-pass Time</p>
              <div className="flex mt-2 gap-5">
                <div className="flex flex-col gap-1">
                  <p className="text-info">Real-time:</p>
                  <p className="text-info">Average (10):</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-info">80000ms</p>
                  <p className="text-info">1900000ms</p>
                </div>
              </div>
            </div>
            <div className="card">
              <p className="text-title">Detection FPS</p>
              <div className="flex mt-2 gap-5">
                <div className="flex flex-col gap-1">
                  <p className="text-info">Real-time:</p>
                  <p className="text-info">Average (10):</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-info">80000ms</p>
                  <p className="text-info">1900000ms</p>
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
                      <p
                        className="text-subinfo uppercase"
                        style={{ fontWeight: "bold" }}
                      >
                        {cpu?.governor}
                      </p>
                      <p
                        className="text-subinfo"
                        style={{ fontWeight: "bold" }}
                      >
                        {cpu?.thread}
                      </p>
                      <p
                        className="text-subinfo"
                        style={{ fontWeight: "bold" }}
                      >
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
    </div>
  );
}
