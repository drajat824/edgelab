// 1. React Core & Hooks
import { useEffect, useState, useMemo, useRef } from "react";

// 2. Reusable UI Components
import Dropdown from "../components/Dropdown";
import InputWithUnit from "../components/TextInput";
import Log from "../components/Log";
import RadioButton from "../components/RadioButton";
import Checkbox from "../components/Checkbox";
import ScriptReference from "../components/ScriptReference";
import ScriptEditor from "../components/ScriptEditor";
import ButtonSave from "../components/ButtonSave";
import ModalAlert from "../components/ModalAlert";

// 3. Loading & Feedback Indicators
import Loading from "../components/Loading.jsx";
import Skeleton from "../components/Skeleton.jsx";
import ActionLoading from "../components/ActionLoading.jsx";

// 4. State Management & Custom Hooks
import useCPU from "../hooks/useCPU";

// 5. API & Data Services
import apiServices from "../services/apiServices";

// 6. Utilities & Helpers
import { generateCommandFunction } from "../utils/generateCommand";

export default function Cpu() {
  // Global Loading Indicators
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const isAutoAdjusting = useRef(false);

  // CPU Core State Management
  const { cpu, dispatch } = useCPU();
  const freqRange = JSON.parse(import.meta.env.VITE_FREQ_RANGE);

  // Configuration Draft States
  const [governor, setGovernor] = useState(cpu?.governor);
  const [freq, setFreq] = useState({ max: cpu?.maxFreq, min: cpu?.minFreq });
  const [numThread, setNumThread] = useState(cpu?.numThread);
  const [cores, setCores] = useState(cpu?.cores);
  const [script, setScript] = useState(cpu?.userspace?.script);

  // Governor Tunable Parameters (Current Draft vs Hardware Baseline)
  const [tunable, setTunable] = useState({});
  const [originalTunable, setOriginalTunable] = useState({});

  // Command Logs/Scripts Terminal Outputs
  const [logGeneral, setLogGeneral] = useState("");
  const [logTunable, setLogTunable] = useState("");
  const [logThreadCore, setLogThreadCore] = useState("");

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

  // Fetch Baseline Hardware Status on Mount with Smooth Transition Padding
  useEffect(() => {
    setIsInitialLoading(true);
    const startTime = Date.now();
    const MINIMUM_DELAY = 800; // Minimal display loading (0.8 detik)

    Promise.all([
      apiServices.getGovernorStatus().then((data) => {
        dispatch({ type: "CHANGE_GOVERNOR", payload: data.governor });
        dispatch({
          type: "CHANGE_GOVERNOR_CONFIG",
          payload: {
            governor: data.governor,
            config: { [data?.governor]: { ...data?.tunables } },
          },
        });
        dispatch({
          type: "CHANGE_GOVERNOR_FREQUENCY",
          payload: { maxFreq: data.maxFreq, minFreq: data.minFreq },
        });
      }),
      apiServices.getThread().then((data) => {
        dispatch({ type: "CHANGE_THREAD_CONFIG", payload: data?.num_threads });
      }),
      apiServices.getCores().then((data) => {
        dispatch({ type: "CHANGE_CORE_CONFIG", payload: data?.cores });
      }),
    ])
      .catch((err) => {
        console.error("Failed to sync with Linux hardware:", err);
        setModalConfig({
          isOpen: true,
          type: "warning",
          title: "Sync Failed",
          message: err?.response?.data?.detail || err?.message || "Failed to synchronize with Linux hardware.",
          confirmText: "OK",
          cancelText: "",
          onConfirm: closeModal,
        });
      })
      .finally(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MINIMUM_DELAY - elapsedTime);

        setTimeout(() => {
          setIsInitialLoading(false);
        }, remainingTime);
      });
  }, [dispatch]);

  // Synchronize Context State Changes into Local Draft Form Fields
  useEffect(() => {
    if (!cpu?.governor) return;
    setGovernor(cpu.governor);
  }, [cpu?.governor]);

  useEffect(() => {
    if (!cpu) return;
    setFreq({ max: cpu.maxFreq, min: cpu.minFreq });
  }, [cpu?.maxFreq, cpu?.minFreq]);

  useEffect(() => {
    if (cpu?.thread === undefined) return;
    setNumThread(cpu.thread);
  }, [cpu?.thread]);

  useEffect(() => {
    if (cpu?.core === undefined) return;
    setCores(cpu.core);
  }, [cpu?.core]);

  useEffect(() => {
    if (!cpu) return;

    const governors = ["performance", "conservative", "powersave", "ondemand", "schedutil", "userspace"];
    const clone = {};
    governors.forEach((gov) => {
      if (cpu[gov] !== undefined) clone[gov] = structuredClone(cpu[gov]);
    });

    setTunable(clone);
    setOriginalTunable(clone);
  }, [cpu?.performance, cpu?.conservative, cpu?.powersave, cpu?.ondemand, cpu?.schedutil, cpu?.userspace]);

  // Core Helper: Check for Modified Configuration Inputs
  function getChangedFields(originalCpu, currentDraft) {
    const changed = {
      governor: originalCpu?.governor !== currentDraft.governor,
      thread: originalCpu?.thread !== currentDraft.thread,
      core: originalCpu?.core !== currentDraft.core,
      freq: {
        max: String(originalCpu?.maxFreq ?? "") !== String(currentDraft.freq?.max ?? ""),
        min: String(originalCpu?.minFreq ?? "") !== String(currentDraft.freq?.min ?? ""),
      },
    };

    const governors = ["performance", "conservative", "powersave", "ondemand", "schedutil", "userspace"];

    governors.forEach((govName) => {
      const govConfig = currentDraft[govName];
      if (typeof govConfig !== "object" || govConfig === null) return;

      changed[govName] = {};
      Object.keys(govConfig).forEach((field) => {
        changed[govName][field] = originalCpu?.[govName]?.[field] !== govConfig[field];
      });
    });

    return changed;
  }

  // Memoized: Global Form Modification Trackers
  const status = useMemo(() => {
    if (!Object.keys(originalTunable).length || !cpu) return {};

    const currentDraft = {
      ...tunable,
      governor,
      freq,
      thread: numThread,
      core: cores,
    };

    return getChangedFields(cpu, currentDraft);
  }, [cpu, tunable, freq, governor, numThread, cores, originalTunable]);

  // Memoized: Individual Save Buttons Disabled/Enabled Matrices
  const disabledButton = useMemo(() => {
    return Object.fromEntries(
      Object.entries(status).map(([key, value]) => {
        if (typeof value === "boolean") {
          const isFreqValid = key !== "freq" || (freq.max !== "" && freq.min !== "");
          return [key, value && isFreqValid];
        }

        const hasChanged = Object.values(value).some(Boolean);
        const hasEmpty = Object.entries(tunable[key] ?? {}).some(([fieldKey, fieldValue]) => {
          if (key === "userspace" && !tunable.userspace?.isDynamicScripting && fieldKey === "script") {
            return false;
          }
          return fieldValue === "";
        });

        return [key, hasChanged && !hasEmpty];
      }),
    );
  }, [status, tunable, freq]);

  // Abstract Core Driver for Generating Command Logs & Dispatching Changes
  const handleSaveAction = ({ type, payload, customStatus = {}, targetDraft = {}, logTarget = "tunable" }) => {
    const isCustom = Object.keys(customStatus).length > 0;
    const finalStatus = isCustom ? customStatus : { [governor]: status[governor] };

    const command = generateCommandFunction({
      status: finalStatus,
      governor: governor,
      numThread: targetDraft.numThread || numThread,
      cores: targetDraft.cores || cores,
      draft: targetDraft.tunable || tunable,
      freqDraft: targetDraft.freqDraft || freq,
    });

    const logMappers = {
      threadCore: setLogThreadCore,
      general: setLogGeneral,
      tunable: setLogTunable,
    };

    if (logMappers[logTarget]) logMappers[logTarget](command);
    dispatch({ type, payload });
  };

  // --- Hardware Call: Frequency Limits Update ---
  const onSaveFrequency = async () => {
    setIsActionLoading(true);
    const startTime = Date.now();
    const ACTION_MIN_DELAY = 400; // Mencegah modal loading berkedip sekilas (0.4 detik)

    try {
      const data = await apiServices.updateFrequency({
        minFreq: freq.min,
        maxFreq: freq.max,
      });

      if (data && data.status === "success") {
        handleSaveAction({
          type: "CHANGE_GOVERNOR_FREQUENCY",
          payload: { maxFreq: data.maxFreq, minFreq: data.minFreq },
          customStatus: { freq: status.freq },
          targetDraft: { freqDraft: freq },
          logTarget: "general",
        });
      }
    } catch (error) {
      console.error("Error executing updateFrequency:", error);
      setModalConfig({
        isOpen: true,
        type: "warning",
        title: "Update Failed",
        message: error?.response?.data?.detail || error?.message || "Failed to update frequency.",
        confirmText: "OK",
        cancelText: "",
        onConfirm: closeModal,
      });
    } finally {
      const remainingTime = Math.max(0, ACTION_MIN_DELAY - (Date.now() - startTime));
      setTimeout(() => setIsActionLoading(false), remainingTime);
    }
  };

  // --- Hardware Call: Governor Parameters (Tunables) Update ---
  const onSaveTunnable = async () => {
    setIsActionLoading(true);
    const startTime = Date.now();
    const ACTION_MIN_DELAY = 400;

    try {
      const response = await apiServices.updateGovernorParams(tunable[cpu?.governor]);
      const data = response?.data || response;

      if (data && data.status === "success") {
        handleSaveAction({
          type: "CHANGE_GOVERNOR_CONFIG",
          payload: { governor, config: tunable },
          customStatus: {},
          targetDraft: { tunable },
          logTarget: "tunable",
        });

        handleSaveAction({
          type: "CHANGE_GOVERNOR_CONFIG",
          payload: {
            governor: data.governor,
            config: { [data?.governor]: { ...data?.tunables } },
          },
          customStatus: {},
          targetDraft: { tunable },
          logTarget: "tunable",
        });
      }
    } catch (error) {
      console.error("Error executing updateGovernorParams:", error);
      setModalConfig({
        isOpen: true,
        type: "warning",
        title: "Update Failed",
        message: error?.response?.data?.detail || error?.message || "Failed to update governor parameters.",
        confirmText: "OK",
        cancelText: "",
        onConfirm: closeModal,
      });
    } finally {
      const remainingTime = Math.max(0, ACTION_MIN_DELAY - (Date.now() - startTime));
      setTimeout(() => setIsActionLoading(false), remainingTime);
    }
  };

  // --- Hardware Call: Main Scaling Governor Switch ---
  const onSaveGovernor = async () => {
    if (governor === cpu?.governor) return;

    setIsActionLoading(true);
    const startTime = Date.now();
    const ACTION_MIN_DELAY = 400;

    try {
      const data = await apiServices.updateGovernor({ governor: governor });
      if (data && data.status === "success") {
        const command = generateCommandFunction({
          status: { governor: true },
          governor: governor,
          draft: { governor: governor },
        });
        setLogGeneral(command);
        dispatch({
          type: "CHANGE_GOVERNOR_CONFIG",
          payload: {
            governor: data.governor,
            config: { [data?.governor]: { ...data?.tunables } },
          },
        });
        dispatch({ type: "CHANGE_GOVERNOR", payload: data.governor });
      } else {
        console.error("Gagal memperbarui governor melalui updateGovernor:", data?.detail);
      }
    } catch (error) {
      console.error("Error executing updateGovernor:", error);
      setModalConfig({
        isOpen: true,
        type: "warning",
        title: "Update Failed",
        message: error?.response?.data?.detail || error?.message || "Failed to update governor setting.",
        confirmText: "OK",
        cancelText: "",
        onConfirm: closeModal,
      });
    } finally {
      const remainingTime = Math.max(0, ACTION_MIN_DELAY - (Date.now() - startTime));
      setTimeout(() => setIsActionLoading(false), remainingTime);
    }
  };

  // --- Hardware Call: Execution Workers Thread Allocation ---
  const onSaveThread = async () => {
    setIsActionLoading(true);
    const startTime = Date.now();
    const ACTION_MIN_DELAY = 400;

    try {
      const response = await apiServices.updateThread({ numThread: numThread });
      const data = response?.data || response;

      if (data && data.status === "success") {
        handleSaveAction({
          type: "CHANGE_THREAD_CONFIG",
          payload: data.num_threads,
          customStatus: { thread: true },
          targetDraft: { numThread },
          logTarget: "threadCore",
        });
      }
    } catch (error) {
      console.error("Error executing updateThread:", error);
      setModalConfig({
        isOpen: true,
        type: "warning",
        title: "Update Failed",
        message: error?.response?.data?.detail || error?.message || "Failed to update thread configuration.",
        confirmText: "OK",
        cancelText: "",
        onConfirm: closeModal,
      });
    } finally {
      const remainingTime = Math.max(0, ACTION_MIN_DELAY - (Date.now() - startTime));
      setTimeout(() => setIsActionLoading(false), remainingTime);
    }
  };

  // --- Hardware Call: Core Affinity Pinning Settings ---
  const onSaveCore = async () => {
    setIsActionLoading(true);
    const startTime = Date.now();
    const ACTION_MIN_DELAY = 400;

    try {
      const response = await apiServices.updateCores({ cores: cores });
      const data = response?.data || response;

      if (data && data.status === "success") {
        handleSaveAction({
          type: "CHANGE_CORE_CONFIG",
          payload: data.cores,
          customStatus: { core: true },
          targetDraft: { cores: cores },
          logTarget: "threadCore",
        });
      }
    } catch (error) {
      console.error("Error executing updateCores:", error);
      setModalConfig({
        isOpen: true,
        type: "warning",
        title: "Update Failed",
        message: error?.response?.data?.detail || error?.message || "Failed to update CPU cores.",
        confirmText: "OK",
        cancelText: "",
        onConfirm: closeModal,
      });
    } finally {
      const remainingTime = Math.max(0, ACTION_MIN_DELAY - (Date.now() - startTime));
      setTimeout(() => setIsActionLoading(false), remainingTime);
    }
  };

  // Safety Validation: Intercept Userspace Freq Bound Violation
  useEffect(() => {
    if (!cpu || cpu?.governor !== "userspace") return;

    setTunable((prev) => {
      const value = prev?.userspace?.fixedFrequency;
      const newFreq = value < cpu?.minFreq ? cpu?.minFreq : value > cpu?.maxFreq ? cpu?.maxFreq : value;
      if (newFreq === value) return prev;
      isAutoAdjusting.current = true;

      return {
        ...prev,
        userspace: { ...prev.userspace, fixedFrequency: newFreq },
      };
    });
  }, [cpu?.maxFreq, cpu?.minFreq, cpu?.governor]);

  // Trigger Automatic Hardware Sync post Safety Violation Auto-Adjustment
  useEffect(() => {
    if (!tunable?.userspace?.fixedFrequency) return;
    if (isAutoAdjusting.current) {
      onSaveTunnable();
      isAutoAdjusting.current = false;
    }
  }, [tunable?.userspace?.fixedFrequency]);

  if (!!isInitialLoading)
    return (
      <div className="parent h-full">
        <h1 className="text-xtitle">
          DVFS
          <span className="font-normal text-gray-500 ml-1">(Dynamic Voltage and Frequency Scaling)</span>
        </h1>
        <p className="text-subinfo mt-2 text-gray-500">Manage CPU performance by adjusting voltage and frequency dynamically.</p>
        <Skeleton />
      </div>
    );

  return (
    <div className="parent h-full">
      <h1 className="text-xtitle">
        DVFS
        <span className="font-normal text-gray-500 ml-1">(Dynamic Voltage and Frequency Scaling)</span>
      </h1>
      <p className="text-subinfo mt-2 text-gray-500">Manage CPU performance by adjusting voltage and frequency dynamically.</p>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-none flex items-center py-4 gap-12">
          {/* Dropdown  */}
          <p className="text-info">CPU Governor</p>
          <Dropdown
            value={governor}
            onChange={(e) => {
              (setLogTunable(""), setGovernor(e));
            }}
            options={["performance", "powersave", "ondemand", "conservative", "schedutil", "userspace"]}
            width="w-48"
            actived={status?.governor}
          />
        </div>
        <div className="flex-1 flex flex-col lg:flex-row lg:justify-between lg:items-center">
          {/* Button Change */}
          <button
            onClick={onSaveGovernor}
            disabled={governor === cpu?.governor} // 💡 REVISI: Menggunakan cpu?.governor
            style={{
              color: "white",
              cursor: governor === cpu?.governor ? "not-allowed" : "pointer", // 💡 REVISI: Menggunakan cpu?.governor
            }}
            className="btn bg-blue-500 hover:bg-blue-700 text-subinfo ml-0 lg:ml-4 disabled:bg-gray-400 disabled:text-gray-600"
          >
            CHANGE
          </button>

          {/* Governor Info  */}
          <div className="rounded-md px-2 py-2">
            <p className="text-sm text-black-500">Governor Mode Active</p>
            <p className="text-xl font-semibold text-green-700 uppercase">{cpu?.governor}</p>
          </div>
        </div>
      </div>

      {/* Seting Max - Min Frequency */}
      <div>
        <div className="card flex flex-col gap-5">
          {/* Label  */}
          <p className="text-info" style={{ fontWeight: "bold" }}>
            Frequency <span className="text-info">Max/Min Settings</span>
          </p>
          {/* Input */}

          <div className="flex flex-col lg:flex-row w-full gap-4 lg:justify-between pb-4">
            <div className="flex-none lg:pt-2">
              <p className="text-info">Minimum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              {/* Min Freq  */}
              <Dropdown
                value={freq.min}
                onChange={(value) => {
                  setFreq({ ...freq, min: value });
                }}
                options={freqRange.filter((opt) => opt <= freq.max)}
                width="w-full"
                actived={status?.freq?.min}
                inCard={true}
                capslock={false}
                unit="GHz"
              />
              <div>
                <p className="text-warning">*Minimum frequency must be less than or equal to maximum frequency.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row w-full gap-4 lg:justify-between pb-4">
            <div className="flex-none lg:pt-2">
              <p className="text-info">Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              {/* Max Freq */}
              <Dropdown
                value={freq.max}
                onChange={(value) => {
                  const newMax = value;
                  const newMin = freq.min > newMax ? newMax : freq.min;
                  setFreq({ min: newMin, max: newMax });
                }}
                options={freqRange}
                width="w-full"
                actived={status?.freq?.max}
                inCard={true}
                capslock={false}
                unit="GHz"
              />
              <div>
                <p className="text-warning">*Available Maximum Frequency: 0.6 - 1.8 GHz</p>
              </div>
            </div>
          </div>

          {/* Button  */}
          <ButtonSave disabled={!disabledButton?.freq} onClick={onSaveFrequency} />
        </div>
      </div>

      {/* Log  */}

      <div className="pb-4">
        <Log value={logGeneral} />
      </div>

      {/* performance  */}
      {governor == "performance" && (
        <div className="card flex flex-col gap-5">
          {/* Label  */}
          <p className="text-info" style={{ fontWeight: "bold" }}>
            Performance <span className="text-info">Tunable Parameters</span>
          </p>
          <p className="text-info">The CPU remains locked at the maximum frequency, delivering peak performance but resulting in increased power consumption.</p>
        </div>
      )}

      {/* powersave  */}
      {governor == "powersave" && (
        <div className="card flex flex-col gap-5">
          {/* Label  */}
          <p className="text-info" style={{ fontWeight: "bold" }}>
            Powersave <span className="text-info">Tunable Parameters</span>
          </p>
          <p className="text-info">The CPU remains locked at the minimum frequency, reducing power consumption at the cost of lower performance.</p>
        </div>
      )}

      {/* ondemand  */}
      {governor == "ondemand" && (
        <div>
          <div className="card flex flex-col gap-5">
            {/* Label  */}
            <p className="text-info" style={{ fontWeight: "bold" }}>
              Ondemand <span className="text-info">Tunable Parameters</span>
            </p>

            {/* Sampling Rate  */}
            <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between">
              <div className="flex-none">
                <p className="text-info">Sampling Rate</p>
              </div>
              <div className="w-full lg:w-[70%]">
                <InputWithUnit
                  disabled={cpu?.governor != "ondemand"}
                  type="number"
                  unit="µs"
                  value={tunable?.ondemand?.samplingRate ?? ""}
                  actived={status?.ondemand?.samplingRate}
                  onChange={(e) =>
                    setTunable((prev) => ({
                      ...prev,
                      ondemand: {
                        ...prev.ondemand,
                        samplingRate: Number(e.target.value),
                      },
                    }))
                  }
                  onBlur={() => {
                    setTunable((prev) => {
                      let value = Number(prev.ondemand.samplingRate);
                      if (prev.ondemand.samplingRate === "") return prev;
                      value = Math.max(2000, value);
                      return {
                        ...prev,
                        ondemand: {
                          ...prev.ondemand,
                          samplingRate: value,
                        },
                      };
                    });
                  }}
                  placeholder="Input samping rate"
                />
                <p className="text-warning">*Minimum sampling rate: 2000µs</p>
              </div>
            </div>

            {/* Sampling Down Factor  */}
            <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between">
              <div className="flex-none">
                <p className="text-info">Sampling Down Factor</p>
              </div>
              <div className="w-full lg:w-[70%]">
                <InputWithUnit
                  disabled={cpu?.governor != "ondemand"}
                  actived={status?.ondemand?.samplingDownFactor}
                  type="number"
                  unit=""
                  value={tunable?.ondemand?.samplingDownFactor ?? ""}
                  onChange={(e) =>
                    setTunable((prev) => ({
                      ...prev,
                      ondemand: {
                        ...prev.ondemand,
                        samplingDownFactor: Number(e.target.value),
                      },
                    }))
                  }
                  onBlur={() => {
                    setTunable((prev) => {
                      let value = Number(prev.ondemand.samplingDownFactor);
                      if (prev.ondemand.samplingDownFactor === "") return prev;
                      value = Math.max(1, value);
                      return {
                        ...prev,
                        ondemand: {
                          ...prev.ondemand,
                          samplingDownFactor: value,
                        },
                      };
                    });
                  }}
                  placeholder="Input samping down factor"
                />
                <p className="text-warning">*Minimum sampling down factor: 1</p>
              </div>
            </div>

            {/* Power Bias  */}
            <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between">
              <div className="flex-none pt-2">
                <p className="text-info">Power Bias</p>
              </div>
              <div className="w-full lg:w-[70%]">
                <InputWithUnit
                  actived={status?.ondemand?.powerBias}
                  disabled={cpu?.governor != "ondemand"}
                  type="number"
                  unit="‰"
                  value={tunable?.ondemand?.powerBias ?? ""}
                  onChange={(e) =>
                    setTunable((prev) => ({
                      ...prev,
                      ondemand: {
                        ...prev.ondemand,
                        powerBias: e.target.value,
                      },
                    }))
                  }
                  onBlur={() => {
                    setTunable((prev) => {
                      let value = Number(prev.ondemand.powerBias);
                      if (prev.ondemand.powerBias === "") return prev;
                      value = Math.min(1000, Math.max(0, value));
                      return {
                        ...prev,
                        ondemand: {
                          ...prev.ondemand,
                          powerBias: value,
                        },
                      };
                    });
                  }}
                  placeholder="Input power bias"
                />
                <p className="text-warning">*Available: 0 - 1000‰</p>
              </div>
            </div>

            {/* Threshold  */}
            <div className="flex flex-col lg:flex-row gap-4 w-full gap-4 lg:justify-between mb-2">
              <div className="flex-none pt-2">
                <p className="text-info">Threshold</p>
              </div>
              <div className="bng-red-100 w-full lg:w-[70%] flex flex-col lg:flex-row lg:justify-between gap-4">
                <div className="flex gap-6">
                  <p className="text-info flex-1/4 pt-2">Up</p>
                  <div>
                    <InputWithUnit
                      actived={status?.ondemand?.thresholdUp}
                      disabled={cpu?.governor != "ondemand"}
                      type="number"
                      placeholder="Up Threshold"
                      unit="%"
                      value={tunable?.ondemand?.thresholdUp ?? ""}
                      onChange={(e) =>
                        setTunable((prev) => ({
                          ...prev,
                          ondemand: {
                            ...prev.ondemand,
                            thresholdUp: e.target.value,
                          },
                        }))
                      }
                      onBlur={() => {
                        setTunable((prev) => {
                          let value = Number(prev.ondemand.thresholdUp);
                          if (prev.ondemand.thresholdUp === "") return prev;
                          value = Math.min(100, Math.max(1, value));
                          return {
                            ...prev,
                            ondemand: {
                              ...prev.ondemand,
                              thresholdUp: value,
                            },
                          };
                        });
                      }}
                    />
                    <p className="text-warning">*Available: 1 - 100%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ignore Nice Load */}
            <div className="flex flex-col lg:flex-row gap-4 w-full gap-4 lg:items-center lg:justify-between mb-2">
              <div className="flex-none">
                <p className="text-info">Ignore Nice Load</p>
              </div>
              <div className="w-[70%] flex gap-12">
                <div className="flex items-center gap-8">
                  <Checkbox
                    actived={status?.ondemand?.isIgnoreNice}
                    disabled={cpu?.governor != "ondemand"}
                    checked={tunable?.ondemand?.isIgnoreNice ?? false}
                    onChange={(e) =>
                      setTunable((prev) => ({
                        ...prev,
                        ondemand: {
                          ...prev.ondemand,
                          isIgnoreNice: !prev?.ondemand?.isIgnoreNice ?? true,
                        },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-info">I/O Busy</p>
                  <Checkbox
                    actived={status?.ondemand?.isIoBusy}
                    disabled={cpu?.governor != "ondemand"}
                    checked={tunable?.ondemand?.isIoBusy ?? false}
                    onChange={(e) =>
                      setTunable((prev) => ({
                        ...prev,
                        ondemand: {
                          ...prev.ondemand,
                          isIoBusy: !prev?.ondemand?.isIoBusy ?? true,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <ButtonSave disabled={cpu?.governor != "ondemand" || !disabledButton?.ondemand} onClick={onSaveTunnable} />
          </div>
        </div>
      )}

      {/* conservative  */}
      {governor == "conservative" && (
        <div>
          <div className="card flex flex-col gap-5">
            {/* Label  */}
            <p className="text-info" style={{ fontWeight: "bold" }}>
              Conservative <span className="text-info">Tunable Parameters</span>
            </p>

            {/* Sampling Rate  */}
            <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between">
              <div className="flex-none">
                <p className="text-info">Sampling Rate</p>
              </div>
              <div className="w-full lg:w-[70%]">
                <InputWithUnit
                  actived={status?.conservative?.samplingRate}
                  disabled={cpu?.governor != "conservative"}
                  type="number"
                  unit="µs"
                  value={tunable?.conservative?.samplingRate ?? ""}
                  onChange={(e) =>
                    setTunable((prev) => ({
                      ...prev,
                      conservative: {
                        ...prev.conservative,
                        samplingRate: Number(e.target.value),
                      },
                    }))
                  }
                  placeholder="Input samping rate"
                  onBlur={() => {
                    setTunable((prev) => {
                      let value = Number(prev.conservative.samplingRate);
                      if (prev.conservative.samplingRate === "") return prev;
                      value = Math.max(2000, value);
                      return {
                        ...prev,
                        conservative: {
                          ...prev.conservative,
                          samplingRate: value,
                        },
                      };
                    });
                  }}
                  placeholder="Input samping rate"
                />
                <p className="text-warning">*Minimum sampling rate: 2000µs</p>
              </div>
            </div>

            {/* Sampling Down Factor  */}
            <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between">
              <div className="flex-none">
                <p className="text-info">Sampling Down Factor</p>
              </div>
              <div className="w-full lg:w-[70%]">
                <InputWithUnit
                  actived={status?.conservative?.samplingDownFactor}
                  disabled={cpu?.governor != "conservative"}
                  type="number"
                  unit=""
                  value={tunable?.conservative?.samplingDownFactor ?? ""}
                  onChange={(e) =>
                    setTunable((prev) => ({
                      ...prev,
                      conservative: {
                        ...prev.conservative,
                        samplingDownFactor: Number(e.target.value),
                      },
                    }))
                  }
                  placeholder="Input samping down factor"
                  onBlur={() => {
                    setTunable((prev) => {
                      let value = Number(prev.conservative.samplingDownFactor);
                      if (prev.conservative.samplingDownFactor === "") return prev;
                      value = Math.min(10, Math.max(1, value));
                      return {
                        ...prev,
                        conservative: {
                          ...prev.conservative,
                          samplingDownFactor: value,
                        },
                      };
                    });
                  }}
                  placeholder="Input samping rate"
                />
                <p className="text-warning">*Available sampling down factor: 1- 10</p>
              </div>
            </div>

            {/* Threshold  */}
            <div className="flex flex-col lg:flex-row gap-4 w-full gap-4 lg:justify-between">
              <div className="flex-none pt-2">
                <p className="text-info">Threshold</p>
              </div>
              <div className="bng-red-100 w-full lg:w-[70%] flex flex-col lg:flex-row lg:justify-between gap-4">
                {/* INPUT UP THRESHOLD */}
                <div className="flex gap-6">
                  <p className="text-info pt-2 w-15">Up</p>
                  <div className="w-full">
                    <InputWithUnit
                      actived={status?.conservative?.thresholdUp}
                      disabled={cpu?.governor != "conservative"}
                      type="number"
                      value={tunable?.conservative?.thresholdUp ?? ""}
                      onChange={(e) =>
                        setTunable((prev) => ({
                          ...prev,
                          conservative: {
                            ...prev.conservative,
                            thresholdUp: e.target.value,
                          },
                        }))
                      }
                      onBlur={() => {
                        setTunable((prev) => {
                          let value = Number(prev.conservative.thresholdUp <= prev.conservative.thresholdDown ? Math.max(1, prev.conservative.thresholdDown + 1) : prev.conservative.thresholdUp);
                          if (prev.conservative.thresholdUp === "") return prev;
                          value = Math.min(100, Math.max(1, value));
                          return {
                            ...prev,
                            conservative: {
                              ...prev.conservative,
                              thresholdUp: value,
                            },
                          };
                        });
                      }}
                      placeholder="Up Threshold"
                      unit="%"
                    />
                    <p className="text-warning">*Must be between 1 - 100% and greater than Threshold Down</p>
                  </div>
                </div>

                {/* INPUT DOWN THRESHOLD */}
                <div className="flex gap-6">
                  <p className="text-info pt-2 w-15">Down</p>
                  <div className="w-full">
                    <InputWithUnit
                      actived={status?.conservative?.thresholdDown}
                      disabled={cpu?.governor != "conservative"}
                      type="number"
                      value={tunable?.conservative?.thresholdDown ?? ""}
                      onChange={(e) =>
                        setTunable((prev) => ({
                          ...prev,
                          conservative: {
                            ...prev.conservative,
                            thresholdDown: e.target.value,
                          },
                        }))
                      }
                      onBlur={() => {
                        setTunable((prev) => {
                          let value = Number(prev.conservative.thresholdDown >= prev.conservative.thresholdUp ? Math.max(1, prev.conservative.thresholdUp - 1) : prev.conservative.thresholdDown);

                          if (prev.conservative.thresholdDown === "") return prev;
                          value = Math.min(100, Math.max(1, value));
                          return {
                            ...prev,
                            conservative: {
                              ...prev.conservative,
                              thresholdDown: value,
                            },
                          };
                        });
                      }}
                      placeholder="Down Threshold"
                      unit="%"
                    />
                    <p className="text-warning">*Must be between 1 - 100% and less than Threshold Up</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Frequency Step  */}
            <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between">
              <div className="flex-none pt-2">
                <p className="text-info">Frequency Step</p>
              </div>
              <div className="w-full lg:w-[70%]">
                <InputWithUnit
                  disabled={cpu?.governor != "conservative"}
                  actived={status?.conservative?.frequencyStep}
                  type="number"
                  unit="%"
                  value={tunable?.conservative?.frequencyStep ?? ""}
                  onChange={(e) =>
                    setTunable((prev) => ({
                      ...prev,
                      conservative: {
                        ...prev.conservative,
                        frequencyStep: e.target.value,
                      },
                    }))
                  }
                  placeholder="Input frequency step"
                  onBlur={() => {
                    setTunable((prev) => {
                      let value = Number(prev.conservative.frequencyStep);
                      if (prev.conservative.frequencyStep === "") return prev;
                      value = Math.min(100, Math.max(0, value));
                      return {
                        ...prev,
                        conservative: {
                          ...prev.conservative,
                          frequencyStep: value,
                        },
                      };
                    });
                  }}
                  placeholder="Input samping rate"
                />
                <p className="text-warning">*Available: 0 - 100%</p>
              </div>
            </div>

            {/* Ignore Nice Load */}
            <div className="flex flex-col lg:flex-row gap-4 w-full gap-4 lg:items-center lg:justify-between mb-2">
              <div className="flex-none">
                <p className="text-info">Ignore Nice Load</p>
              </div>
              <div className="w-[70%] flex gap-12">
                <div className="flex items-center gap-8">
                  <Checkbox
                    actived={status?.conservative?.isIgnoreNice}
                    disabled={cpu?.governor != "conservative"}
                    checked={tunable?.conservative?.isIgnoreNice ?? false}
                    onChange={(e) =>
                      setTunable((prev) => ({
                        ...prev,
                        conservative: {
                          ...prev.conservative,
                          isIgnoreNice: !prev?.conservative?.isIgnoreNice ?? true,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <ButtonSave disabled={cpu?.governor != "conservative" || !disabledButton?.conservative} onClick={onSaveTunnable} />
          </div>
        </div>
      )}

      {/* schedutil  */}
      {governor == "schedutil" && (
        <div>
          <div className="card flex flex-col gap-5">
            {/* Label  */}
            <p className="text-info" style={{ fontWeight: "bold" }}>
              Schedutil <span className="text-info">Tunable Parameters</span>
            </p>

            {/* Rate Limit  */}
            <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between">
              <div className="flex-none">
                <p className="text-info">Rate Limit</p>
              </div>
              <div className="w-full lg:w-[70%]">
                <InputWithUnit
                  actived={status?.schedutil?.rateLimit}
                  disabled={cpu?.governor != "schedutil"}
                  type="number"
                  unit="µs"
                  value={tunable?.schedutil?.rateLimit ?? ""}
                  onChange={(e) =>
                    setTunable((prev) => ({
                      ...prev,
                      schedutil: {
                        ...prev.schedutil,
                        rateLimit: e.target.value,
                      },
                    }))
                  }
                  placeholder="Input rate limit"
                />
              </div>
            </div>

            <ButtonSave disabled={cpu?.governor != "schedutil" || !disabledButton?.schedutil} onClick={onSaveTunnable} />
          </div>
        </div>
      )}

      {/* userspace  */}
      {governor == "userspace" && (
        <div>
          <div className="card flex flex-col gap-5">
            {/* Label  */}
            <p className="text-info" style={{ fontWeight: "bold" }}>
              Userspace <span className="text-info">Tunable Parameters</span>
            </p>

            {/* Fixed Frequency  */}
            <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between">
              <div className="flex-none pt-2">
                <p className="text-info">Fixed Frequency</p>
              </div>
              <div className="w-full lg:w-[70%]">
                <Dropdown
                  actived={status?.userspace?.fixedFrequency}
                  inCard={true}
                  value={tunable?.userspace?.fixedFrequency}
                  onChange={(e) =>
                    setTunable((prev) => ({
                      ...prev,
                      userspace: { ...prev.userspace, fixedFrequency: e },
                    }))
                  }
                  options={freqRange.filter((opt) => opt >= freq.min && opt <= freq.max)}
                  width="w-full"
                  disabled={cpu?.governor != "userspace"}
                  capslock={false}
                  unit="GHz"
                />
                <p className="text-warning">*Fixed frequency must stay within the specified range (min - max frequency).</p>
              </div>
            </div>

            <div>
              <div className="flex gap-2 items-center">
                <Checkbox
                  disabled={cpu?.governor != "userspace"}
                  checked={tunable?.userspace?.isDynamicScripting ?? false}
                  onChange={(e) =>
                    setTunable((prev) => ({
                      ...prev,
                      userspace: {
                        ...prev.userspace,
                        isDynamicScripting: !prev?.userspace?.isDynamicScripting ?? true,
                      },
                    }))
                  }
                />
                <p className="text-info">Dynamic Scripting</p>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 pt-4">
                <div className="flex-1">
                  <ScriptEditor
                    disabled={!tunable?.userspace?.isDynamicScripting || cpu?.governor != "userspace"}
                    value={script}
                    onChange={setScript}
                    isDirty={script !== tunable?.userspace?.script}
                    onSave={(e) => {
                      setTunable((prev) => ({
                        ...prev,
                        userspace: {
                          ...prev.userspace,
                          script: e,
                        },
                      }));
                    }}
                  />
                </div>
                <div className="flex-1">
                  <ScriptReference />
                </div>
              </div>
            </div>

            <ButtonSave disabled={cpu?.governor != "userspace" || !disabledButton?.userspace} onClick={onSaveTunnable} />
          </div>
        </div>
      )}

      {/* Log  */}
      {governor != "performance" && governor != "powersave" && <Log value={logTunable} />}

      {/* Thread & Core  */}
      <div className="pt-8">
        {/* Title  */}
        <h1 className="text-xtitle">Thread Allocation & Core Pinning</h1>

        <p className="text-subinfo mt-2 text-gray-500">Optimize performance by assigning processes to specific CPU cores and managing thread distribution.</p>

        {/* Card  */}
        <div className="flex flex-col lg:flex-row pt-4 justify-between gap-4 h-full">
          <div className="card flex-1">
            <div className="flex flex-col justify-between h-full pb-1 gap-4">
              <p className="text-info" style={{ fontWeight: "bold" }}>
                Thread Allocation
              </p>
              <div>
                <InputWithUnit
                  actived={status?.thread}
                  type="number"
                  value={numThread}
                  onChange={(e) => {
                    setNumThread(e.target.value);
                  }}
                  onBlur={() => {
                    let value = numThread;
                    value = Number(value);
                    if (value < 1) value = 1;
                    if (value > 4) value = 4;
                    setNumThread(value);
                  }}
                  placeholder="Input thread"
                />
              </div>
              <p className="text-warning">*Available Maximum Thread: 4</p>
              <ButtonSave disabled={cpu?.thread === numThread || numThread == ""} onClick={onSaveThread} />
            </div>
          </div>

          <div className="card flex-1">
            <div className="flex flex-col justify-between gap-4 h-full pb-1 gap-4">
              <p className="text-info" style={{ fontWeight: "bold" }}>
                Core Pinning
              </p>
              <div>
                <RadioButton
                  multiple
                  name="cores"
                  value={cores}
                  onChange={(e) => {
                    const sortedCores = [...e].sort((a, b) => a - b);
                    setCores(sortedCores);
                  }}
                  options={[
                    { label: "Core 0", value: 0 },
                    { label: "Core 1", value: 1 },
                    { label: "Core 2", value: 2 },
                    { label: "Core 3", value: 3 },
                  ]}
                />
              </div>
              <ButtonSave disabled={cpu?.core === cores || cores?.length == 0} onClick={onSaveCore} />
            </div>
          </div>
        </div>

        <Log value={logThreadCore} />
      </div>
      {!!isActionLoading ? <ActionLoading /> : <ModalAlert isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} message={modalConfig.message} confirmText={modalConfig.confirmText} cancelText={modalConfig.cancelText} onClose={closeModal} onConfirm={modalConfig.onConfirm} />}
    </div>
  );
}
