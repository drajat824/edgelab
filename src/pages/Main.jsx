import { useState, useEffect } from "react";
import Play from "../assets/play.svg";
import Stop from "../assets/stop.svg";
import ProgressBar from "../components/ProgressBar";
import Dropdown from "../components/Dropdown";

// State Management
import useCPU from "../hooks/useCPU";
import useGround from "../hooks/useGround";

import {cpuService} from "../services/cpuServices"

export default function Main() {
  const { cpu, dispatch } = useCPU();
  const { boards } = useGround();
  const [boardsName, setBoardsName] = useState([]);

  const [cpuUtilization, setCpuUtilization] = useState({
    average: 0,
    cores: [0, 0, 0, 0],
  });
  const [cpuStatus, setCpuStatus] = useState({
    frequency: "0.0 GHz",
    temperature: 0.0,
  });

  const [model, setModel] = useState("SSD MobileNet V3 Small");
  const [fps, setFps] = useState("FPS 30");
  const [board, setBoard] = useState("Board 1");

  const [streamMode, setStreamMode] = useState(0); // 0: Stop, 1: Start

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
    const wsStatus = new WebSocket(`${import.meta.env.VITE_API}/ws/status`);
    wsStatus.onopen = () => console.log("Connected to Status WS");
    wsStatus.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Status Data:", data);
      setCpuStatus(data);
    };
    wsStatus.onclose = () => console.log("Disconnected from Status WS");
    return () => wsStatus.close();
  }, []);

  useEffect(() => {
    if (!boards) return;
    const names = boards.map((e) => e?.board_name);
    setBoardsName(names);
  }, [boards]);

  useEffect(() => {
    console.log("Stream Mode changed:", streamMode);
  }, [streamMode]);

  // GET AXIOS DATA

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
  }, [dispatch]);

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
              onChange={setFps}
              options={[
                "FPS 30",
                "FPS 25",
                "FPS 20",
                "FPS 15",
                "FPS 10",
                "FPS 5",
              ]}
            />
          </div>

          {/* Streaming Camera */}
          <div className="card-stream w-full h-[350px] flex items-center justify-center">
            <p>Camera Stream!</p>
          </div>
          {/* Button */}
          <div className="flex justify-between mt-9 gap-10 items-end">
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
        </div>

        {/* ACCURACY METRICS  */}
        <div className="flex-none flex flex-col">
          <div className="flex justify-end">
            <Dropdown
              width="w-40"
              value={board}
              onChange={setBoard}
              options={boardsName}
            />
          </div>
          <div className="flex flex-col gap-2 mt-4">
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
          </div>
        </div>
      </div>

      {/* INFO  */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 mt-4 max-w-screen">
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
                <ProgressBar value={cpuUtilization?.cores[1]} />
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-subinfo">Core 1</span>
                  <span className="text-subinfo">
                    {cpuUtilization?.cores[1]}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="gap-2 w-full">
                <ProgressBar value={cpuUtilization?.cores[2]} />
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-subinfo">Core 2</span>
                  <span className="text-subinfo">
                    {cpuUtilization?.cores[2]}%
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
  );
}
