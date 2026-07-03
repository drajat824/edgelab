import { useEffect, useState, useMemo, useRef } from "react";
import Dropdown from "../components/Dropdown";
import InputWithUnit from "../components/TextInput";
import Log from "../components/Log";
import RadioButton from "../components/RadioButton";
import Checkbox from "../components/Checkbox";
import ScriptReference from "../components/ScriptReference";
import ScriptEditor from "../components/ScriptEditor";
import ButtonSave from "../components/ButtonSave";
import { generateCommandFunction } from "../utils/generateCommand";

// API
import { cpuService } from "../services/cpuServices";

// State Management
import useCPU from "../hooks/useCPU";

export default function Cpu() {
  const { cpu, dispatch } = useCPU();

  // Governor & Data Draft
  const [governor, setGovernor] = useState(cpu?.governor);
  const [freq, setFreq] = useState({ max: cpu?.maxFreq, min: cpu?.minFreq });
  const [tunable, setTunable] = useState({});
  const [threadDraft, setThreadDraft] = useState(cpu?.thread);
  const [coreDraft, setCoreDraft] = useState(cpu?.core);

  // Data asli & Status Perubahan
  const [originalTunable, setOriginalTunable] = useState({});
  // 💡 REVISI: Hapus `const [status, setStatus] = useState({})` karena sudah diganti useMemo di bawah!

  // Script/logTunable command
  const [logTunable, setLogTunable] = useState("");
  const [logThreadCore, setLogThreadCore] = useState("");
  const [logGeneral, setLogGeneral] = useState("");
  const [script, setScript] = useState(cpu?.userspace?.script);

  // AXIOS
  useEffect(() => {
    cpuService
      .getGovernorStatus()
      .then((data) => {
        console.log(data?.tunables);

        dispatch({
          type: "CHANGE_GOVERNOR",
          payload: data.governor,
        });

        dispatch({
          type: "CHANGE_GOVERNOR_CONFIG",
          payload: {
            governor: data.governor,
            config: {
              [data?.governor]: {
                ...data?.tunables,
              },
            },
          },
        });

        dispatch({
          type: "CHANGE_GOVERNOR_FREQUENCY",
          payload: {
            maxFreq: data.maxFreq,
            minFreq: data.minFreq,
          },
        });
      })
      .catch((err) => {
        console.error("Gagal sinkronisasi dengan hardware Linux:", err);
      });
  }, [dispatch]);

  /**
   * Membandingkan original dengan tunable
   * 💡 REVISI: Disederhanakan menjadi hanya 2 argumen karena semua data sudah disatukan ke currentDraft
   */
  function getChangedFields(originalCpu, currentDraft) {
    const changed = {
      governor: originalCpu?.governor !== currentDraft.governor,
      thread: originalCpu?.thread !== currentDraft.thread,
      core: originalCpu?.core !== currentDraft.core,
      freq: {
        max:
          String(originalCpu?.maxFreq ?? "") !==
          String(currentDraft.freq?.max ?? ""),
        min:
          String(originalCpu?.minFreq ?? "") !==
          String(currentDraft.freq?.min ?? ""),
      },
    };

    // Pengecekan khusus untuk parameter di dalam masing-masing governor
    const governors = [
      "performance",
      "conservative",
      "powersave",
      "ondemand",
      "schedutil",
      "userspace",
    ];

    governors.forEach((govName) => {
      const govConfig = currentDraft[govName];
      if (typeof govConfig !== "object" || govConfig === null) return;

      changed[govName] = {};
      Object.keys(govConfig).forEach((field) => {
        changed[govName][field] =
          originalCpu?.[govName]?.[field] !== govConfig[field];
      });
    });

    return changed;
  }

  // --- 1. SINKRONISASI DATA DARI CPU CONTEXT ---
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
    setThreadDraft(cpu.thread);
  }, [cpu?.thread]);

  useEffect(() => {
    if (cpu?.core === undefined) return;
    setCoreDraft(cpu.core);
  }, [cpu?.core]);

  useEffect(() => {
    if (!cpu) return;

    const governors = [
      "performance",
      "conservative",
      "powersave",
      "ondemand",
      "schedutil",
      "userspace",
    ];
    const clone = {};
    governors.forEach((gov) => {
      if (cpu[gov] !== undefined) clone[gov] = structuredClone(cpu[gov]);
    });

    setTunable(clone);
    setOriginalTunable(clone);
  }, [
    cpu?.performance,
    cpu?.conservative,
    cpu?.powersave,
    cpu?.ondemand,
    cpu?.schedutil,
    cpu?.userspace,
  ]);

  // --- 2. PEMBANDING DATA (STATUS PERUBAHAN) ---
  // 💡 REVISI: Memperbaiki duplikasi deklarasi variabel 'status'
  const status = useMemo(() => {
    if (!Object.keys(originalTunable).length || !cpu) return {};

    const currentDraft = {
      ...tunable,
      governor,
      freq,
      thread: threadDraft,
      core: coreDraft,
    };

    return getChangedFields(cpu, currentDraft);
  }, [cpu, tunable, freq, governor, threadDraft, coreDraft, originalTunable]);

  // --- 3. STATUS TOMBOL SAVE BUTTON ---
  const disabledButton = useMemo(() => {
    return Object.fromEntries(
      Object.entries(status).map(([key, value]) => {
        // Handle properti top-level berbentuk boolean (governor, freq, thread, core)
        if (typeof value === "boolean") {
          const isFreqValid =
            key !== "freq" || (freq.max !== "" && freq.min !== "");
          return [key, value && isFreqValid];
        }

        // Handle konfigurasi internal governor berbentuk objek
        // 💡 REVISI: Mengubah 'tunablesDraft' yang typo menjadi 'tunable' sesuai deklarasi state atas
        const hasChanged = Object.values(value).some(Boolean);
        const hasEmpty = Object.entries(tunable[key] ?? {}).some(
          ([fieldKey, fieldValue]) => {
            if (
              key === "userspace" &&
              !tunable.userspace?.isDynamicScripting &&
              fieldKey === "script"
            ) {
              return false;
            }
            return fieldValue === "";
          },
        );

        return [key, hasChanged && !hasEmpty];
      }),
    );
  }, [status, tunable, freq]);

  // --- 4. ACTION HANDLER FOR SAVE ---
  const handleSaveAction = ({
    type,
    payload,
    customStatus = {},
    targetDraft = {},
    logTarget = "tunable",
  }) => {
    // 💡 PERBAIKAN: Tentukan secara tegas apakah ini aksi kustom (freq, thread, core) atau aksi tunable
    const isCustom = Object.keys(customStatus).length > 0;

    // Jika kustom, gunakan customStatus utuh. Jika untuk tunable, isolasi hanya status milik governor aktif saat ini.
    const finalStatus = isCustom
      ? customStatus
      : { [governor]: status[governor] }; // Bersih total, hanya membawa objek tunable governor aktif (misal: status.schedutil)

    const command = generateCommandFunction({
      status: finalStatus,
      governor: governor, // 🚀 KIRIM GOVERNOR AKTIF SECARA EKSPLISIT KESINI
      threadDraft: targetDraft.threadDraft || threadDraft,
      coreDraft: targetDraft.coreDraft || coreDraft,
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

  // --- REFACTOR ACTION FUNCTIONS ---
  const onSaveFrequency = () => {
    handleSaveAction({
      type: "CHANGE_GOVERNOR_FREQUENCY",
      payload: { maxFreq: freq.max, minFreq: freq.min },
      // 💡 Hanya kirim status frekuensi saat ini
      customStatus: { freq: status.freq },
      targetDraft: { freqDraft: freq },
      logTarget: "general",
    });
  };

  const onSaveGovernor = () => {
    handleSaveAction({
      type: "CHANGE_GOVERNOR_CONFIG",
      payload: { governor, config: tunable },
      customStatus: {}, // 💡 Biarkan kosong agar otomatis mengisolasi [governor] saja lewat finalStatus
      targetDraft: { tunable },
      logTarget: "tunable",
    });
  };

  const onSaveThread = () => {
    handleSaveAction({
      type: "CHANGE_THREAD_CONFIG",
      payload: threadDraft,
      // 💡 Hanya kirim status thread, frekuensi dipastikan terbuang secara absolut
      customStatus: { thread: true },
      targetDraft: { threadDraft },
      logTarget: "threadCore",
    });
  };

  const onSaveCore = () => {
    handleSaveAction({
      type: "CHANGE_CORE_CONFIG",
      payload: coreDraft,
      // 💡 Hanya kirim status core, frekuensi dipastikan terbuang secara absolut
      customStatus: { core: true },
      targetDraft: { coreDraft },
      logTarget: "threadCore",
    });
  };

  const onChangeGovernor = () => {
    // 1. Validasi: Hanya jalankan jika ada perubahan dari sistem
    if (governor !== cpu?.governor) {
      // 💡 REVISI: Kirim parameter dengan struktur yang tepat
      const command = generateCommandFunction({
        status: { governor: true },
        governor: governor, // 🚀 Kirim governor eksplisit
        draft: { governor: [governor] },
      });

      setLogGeneral(command);
    }

    // 2. Dispatch perubahan ke reducer
    dispatch({ type: "CHANGE_GOVERNOR", payload: governor });
  };

  const isAutoAdjusting = useRef(false);

  useEffect(() => {
    if (!cpu || cpu?.governor !== "userspace") return;

    setTunable((prev) => {
      const value = prev?.userspace?.fixedFrequency;
      const newFreq =
        value < cpu?.minFreq
          ? cpu?.minFreq
          : value > cpu?.maxFreq
            ? cpu?.maxFreq
            : value;
      if (newFreq === value) return prev;
      isAutoAdjusting.current = true;

      return {
        ...prev,
        userspace: {
          ...prev.userspace,
          fixedFrequency: newFreq,
        },
      };
    });
  }, [cpu?.maxFreq, cpu?.minFreq, cpu?.governor]);

  useEffect(() => {
    if (!tunable?.userspace?.fixedFrequency) return;
    if (isAutoAdjusting.current) {
      onSaveGovernor(); // Eksekusi save otomatis
      isAutoAdjusting.current = false; // Reset kembali flag-nya
    }
  }, [tunable?.userspace?.fixedFrequency]);
  return (
    <div className="parent h-full">
      <h1 className="text-xtitle">
        DVFS
        <span className="font-normal text-gray-500 ml-1">
          (Dynamic Voltage and Frequency Scaling)
        </span>
      </h1>
      <p className="text-subinfo mt-2 text-gray-500">
        Manage CPU performance by adjusting voltage and frequency dynamically.
      </p>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-none flex items-center py-4 gap-12">
          {/* Dropdown  */}
          <p className="text-info">CPU Governor</p>
          <Dropdown
            value={governor}
            onChange={(e) => {
              (setLogTunable(""), setGovernor(e));
            }}
            options={[
              "performance",
              "powersave",
              "ondemand",
              "conservative",
              "schedutil",
              "userspace",
            ]}
            width="w-48"
            actived={status?.governor}
          />
        </div>
        <div className="flex-1 flex flex-col lg:flex-row lg:justify-between lg:items-center">
          {/* Button Change */}
          <button
            onClick={onChangeGovernor}
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
            <p className="text-xl font-semibold text-green-700 uppercase">
              {cpu?.governor}
            </p>
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
                  // const newFix =
                  //   tunable?.userspace?.fixedFrequency < value
                  //     ? value
                  //     : tunable?.userspace?.fixedFrequency;
                  setFreq({ ...freq, min: value });
                  // setTunable((prev) => ({
                  //   ...prev,
                  //   userspace: { ...prev.userspace, fixedFrequency: newFix },
                  // }));
                }}
                options={[1.4, 1.7, 2.1].filter((opt) => opt <= freq.max)}
                width="w-full"
                actived={status?.freq?.min}
                inCard={true}
              />
              <div>
                <p className="text-warning">
                  *Minimum frequency must be less than or equal to maximum
                  frequency.
                </p>
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
                  // const newFix =
                  //   tunable?.userspace?.fixedFrequency > newMax
                  //     ? newMax
                  //     : tunable?.userspace?.fixedFrequency;
                  setFreq({ min: newMin, max: newMax });
                  // setTunable((prev) => ({
                  //   ...prev,
                  //   userspace: {
                  //     ...prev.userspace,
                  //     fixedFrequency: newFix,
                  //   },
                  // }));
                }}
                options={[1.4, 1.7, 2.1]}
                width="w-full"
                actived={status?.freq?.max}
                inCard={true}
              />
              <div>
                <p className="text-warning">
                  *Available Maximum Frequency: 0.6 - 1.8 GHz
                </p>
              </div>
            </div>
          </div>

          {/* Button  */}
          <ButtonSave
            disabled={!disabledButton?.freq}
            onClick={onSaveFrequency}
          />
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
          <p className="text-info">
            The CPU remains locked at the maximum frequency, delivering peak
            performance but resulting in increased power consumption.
          </p>
        </div>
      )}

      {/* powersave  */}
      {governor == "powersave" && (
        <div className="card flex flex-col gap-5">
          {/* Label  */}
          <p className="text-info" style={{ fontWeight: "bold" }}>
            Powersave <span className="text-info">Tunable Parameters</span>
          </p>
          <p className="text-info">
            The CPU remains locked at the minimum frequency, reducing power
            consumption at the cost of lower performance.
          </p>
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
                  unit="ms"
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
                  placeholder="Input samping rate"
                />
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
                  unit="ms"
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
                  placeholder="Input samping down factor"
                />
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
                  unit="%"
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
                      value = Math.min(100, Math.max(0, value));
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
                <p className="text-warning">*Available: 1 - 100%</p>
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

            <ButtonSave
              disabled={
                cpu?.governor != "ondemand" || !disabledButton?.ondemand
              }
              onClick={onSaveGovernor}
            />
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
                  unit="ms"
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
                />
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
                  unit="ms"
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
                />
              </div>
            </div>

            {/* Frequency Step  */}
            <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between">
              <div className="flex-none pt-2">
                <p className="text-info">Frequency Step</p>
              </div>
              <div className="w-full lg:w-[70%]">
                <InputWithUnit
                  actived={status?.conservative?.frequencyStep}
                  disabled={cpu?.governor != "conservative"}
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
                  onBlur={() => {
                    setTunable((prev) => {
                      let value = Number(prev.conservative.frequencyStep);
                      if (prev.conservative.frequencyStep === "") return prev;
                      value = Math.min(100, Math.max(1, value));
                      return {
                        ...prev,
                        conservative: {
                          ...prev.conservative,
                          frequencyStep: value,
                        },
                      };
                    });
                  }}
                  placeholder="Input frequency step"
                />
                <p className="text-warning">*Available: 1 - 100%</p>
              </div>
            </div>

            {/* Threshold  */}
            <div className="flex flex-col lg:flex-row gap-4 w-full gap-4 lg:justify-between">
              <div className="flex-none pt-2">
                <p className="text-info">Threshold</p>
              </div>
              <div className="bng-red-100 w-full lg:w-[70%] flex flex-col lg:flex-row lg:justify-between gap-4">
                <div className="flex gap-6">
                  <p className="text-info pt-2 flex-1/4">Up</p>
                  <div>
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
                          let value = Number(prev.conservative.thresholdUp);
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
                    <p className="text-warning">*Available: 1 - 100%</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <p className="text-info flex-1/4 pt-2">Down</p>
                  <div>
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
                          let value = Number(prev.conservative.thresholdDown);
                          if (prev.conservative.thresholdDown === "")
                            return prev;
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
                    actived={status?.conservative?.isIgnoreNice}
                    disabled={cpu?.governor != "conservative"}
                    checked={tunable?.conservative?.isIgnoreNice ?? false}
                    onChange={(e) =>
                      setTunable((prev) => ({
                        ...prev,
                        conservative: {
                          ...prev.conservative,
                          isIgnoreNice:
                            !prev?.conservative?.isIgnoreNice ?? true,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <ButtonSave
              disabled={
                cpu?.governor != "conservative" || !disabledButton?.conservative
              }
              onClick={onSaveGovernor}
            />
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
                  unit="ms"
                  value={tunable?.schedutil?.rateLimit ?? ""}
                  onChange={(e) =>
                    setTunable((prev) => ({
                      ...prev,
                      schedutil: {
                        ...prev.schedutil,
                        rateLimit: Number(e.target.value),
                      },
                    }))
                  }
                  placeholder="Input rate limit"
                />
              </div>
            </div>

            <ButtonSave
              disabled={
                cpu?.governor != "schedutil" || !disabledButton?.schedutil
              }
              onClick={onSaveGovernor}
            />
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
                  options={[1.4, 1.7, 2.1].filter(
                    (opt) => opt >= freq.min && opt <= freq.max,
                  )}
                  width="w-full"
                  disabled={cpu?.governor != "userspace"}
                />
                <p className="text-warning">
                  *Fixed frequency must stay within the specified range.
                </p>
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
                        isDynamicScripting:
                          !prev?.userspace?.isDynamicScripting ?? true,
                      },
                    }))
                  }
                />
                <p className="text-info">Dynamic Scripting</p>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 pt-4">
                <div className="flex-1">
                  <ScriptEditor
                    disabled={
                      !tunable?.userspace?.isDynamicScripting ||
                      cpu?.governor != "userspace"
                    }
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

            <ButtonSave
              disabled={
                cpu?.governor != "userspace" || !disabledButton?.userspace
              }
              onClick={onSaveGovernor}
            />
          </div>
        </div>
      )}

      {/* Log  */}
      <Log value={logTunable} />

      {/* Thread & Core  */}
      <div className="pt-8">
        {/* Title  */}
        <h1 className="text-xtitle">Thread Allocation & Core Pinning</h1>

        <p className="text-subinfo mt-2 text-gray-500">
          Optimize performance by assigning processes to specific CPU cores and
          managing thread distribution.
        </p>

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
                  value={threadDraft}
                  onChange={(e) => {
                    setThreadDraft(e.target.value);
                  }}
                  onBlur={() => {
                    let value = threadDraft;
                    value = Number(value);
                    if (value < 1) value = 1;
                    if (value > 4) value = 4;
                    setThreadDraft(value);
                  }}
                  placeholder="Input thread"
                />
              </div>
              <p className="text-warning">*Available Maximum Thread: 4</p>
              <ButtonSave
                disabled={cpu?.thread === threadDraft || threadDraft == ""}
                onClick={onSaveThread}
              />
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
                  value={coreDraft}
                  onChange={(e) => {
                    const sortedCores = [...e].sort((a, b) => a - b);
                    setCoreDraft(sortedCores);
                  }}
                  options={[
                    { label: "Core 0", value: 0 },
                    { label: "Core 1", value: 1 },
                    { label: "Core 2", value: 2 },
                    { label: "Core 3", value: 3 },
                  ]}
                />
              </div>
              <ButtonSave
                disabled={cpu?.core === coreDraft || coreDraft?.length == 0}
                onClick={onSaveCore}
              />
            </div>
          </div>
        </div>

        <Log value={logThreadCore} />
      </div>
    </div>
  );
}
