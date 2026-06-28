import { useEffect, useState, useMemo } from 'react'
import Dropdown from '../components/Dropdown'
import InputWithUnit from '../components/TextInput'
import Log from '../components/Log';
import RadioButton from '../components/RadioButton';
import Checkbox from '../components/Checkbox';
import ScriptReference from '../components/ScriptReference'
import ScriptEditor from '../components/ScriptEditor'
import ButtonSave from '../components/ButtonSave'
import { generateCommandFunction } from "../utils/generateCommand"

// State Management
import useCPU from "../hooks/useCPU"

export default function Cpu() {
  const { cpu, dispatch } = useCPU();

  // Governor & Data Draft
  const [governor, setGovernor] = useState(cpu?.governor);
  const [draft, setDraft] = useState({});
  const [threadDraft, setThreadDraft] = useState(cpu?.thread);
  const [coreDraft, setCoreDraft] = useState(cpu?.core);

  // Data asli & Status Perubahan
  const [originalDraft, setOriginalDraft] = useState({});
  const [status, setStatus] = useState({});

  // Script/log command
  const [log, setLog] = useState("");
  const [log2, setLog2] = useState("");
  const [script, setScript] = useState("");

  /**
   * Membandingkan original dengan draft
   */
  function getChangedFields(original, currentDraft) {
    const changed = {
      governor: original.governor !== governor,
    };

    Object.entries(currentDraft).forEach(([key, value]) => {
      if (key === "governor" || typeof value !== "object" || value === null) return;

      changed[key] = {};
      Object.keys(value).forEach((field) => {
        changed[key][field] = original[key]?.[field] !== value[field];
      });
    });

    return changed;
  }

  /**
   * Mengambil data CPU dari Context
   * Memanfaatkan teknik kloning yang lebih dinamis agar tidak hardcode nama governor
   */
  useEffect(() => {
    if (!cpu) return;

    // List governor yang di-track secara dinamis
    const governors = ['governor', 'performance', 'conservative', 'powersave', 'ondemand', 'schedutil', 'userspace'];
    const clone = {};

    governors.forEach(gov => {
      if (cpu[gov] !== undefined) clone[gov] = structuredClone(cpu[gov]);
    });

    setDraft(clone);
    setOriginalDraft(clone);
  }, [cpu]);

  /**
   * Hitung perubahan setiap kali draft atau governor berubah
   */
  useEffect(() => {
    if (!Object.keys(originalDraft).length) return;
    setStatus(getChangedFields(originalDraft, draft));
  }, [draft, originalDraft, governor]);

  /**
   * Status tombol Save.
   */
  const disabledButton = useMemo(() => {
    return Object.fromEntries(
      Object.entries(status).map(([key, value]) => {
        if (typeof value === "boolean") return [key, value];

        const hasChanged = Object.values(value).some(Boolean);
        const hasEmpty = Object.values(draft[key] ?? {}).some(v => v === "");

        // Menyederhanakan penamaan agar sesuai logika (true berarti tombol AKTIF / bisa diklik)
        return [key, hasChanged && !hasEmpty];
      })
    );
  }, [status, draft]);

  /**
   * Helper fungsi untuk membungkus pembuatan log command & dispatch
   */
  const handleSaveAction = (actionType, payload, customStatus, targetDraft, isLog2 = false) => {
    const command = generateCommandFunction({
      status: { ...status, ...customStatus },
      ...(targetDraft.threadDraft && { threadDraft: targetDraft.threadDraft }),
      ...(targetDraft.coreDraft && { coreDraft: targetDraft.coreDraft }),
      ...(targetDraft.draft && { draft: targetDraft.draft }),
    });

    if (isLog2) setLog2(command); else setLog(command);
    dispatch({ type: actionType, payload });
  };

  // --- REFACTOR ACTION FUNCTIONS ---

  const onSaveGovernor = () => {
    handleSaveAction("CHANGE_GOVERNOR_CONFIG", { governor, config: draft }, {}, { draft });
  };

  const onSaveThread = () => {
    handleSaveAction("CHANGE_THREAD_CONFIG", threadDraft, { thread: true }, { threadDraft }, true);
  };

  const onSaveCore = () => {
    handleSaveAction("CHANGE_CORE_CONFIG", coreDraft, { core: true }, { coreDraft }, true);
  };

  const onChangeGovernor = () => {
    if (governor !== originalDraft.governor) {
      const command = generateCommandFunction({
        status: { ...status, governor: true },
        draft: { ...draft, governor },
      });
      setLog(command);
    }
    dispatch({ type: "CHANGE_GOVERNOR", payload: governor });
  };

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

      <div className='flex flex-col lg:flex-row'>
        <div className="flex-none flex items-center py-4 gap-12">

          {/* Dropdown  */}
          <p className="text-info">CPU Governor</p>
          <Dropdown
            value={governor}
            onChange={(e) => setGovernor(e)}
            options={['performance', 'powersave', 'ondemand', 'conservative', 'schedutil', 'userspace']}
            width="w-48"
          />
        </div>
        <div className='flex-1 flex flex-col lg:flex-row lg:justify-between lg:items-center'>

          {/* Button Change */}
          <button onClick={onChangeGovernor} disabled={governor === originalDraft?.governor} style={{ color: 'white', cursor: governor === originalDraft?.governor ? "not-allowed" : "pointer" }} className="btn bg-blue-500 hover:bg-blue-700 text-subinfo ml-0 lg:ml-4 disabled:bg-gray-400 disabled:text-gray-600">
            CHANGE
          </button>

          {/* Governor Info  */}
          <div className="rounded-md px-2 py-2">
            <p className="text-sm text-black-500">
              Governor Mode Active
            </p>
            <p className="text-xl font-semibold text-green-700 uppercase">
              {cpu?.governor}
            </p>
          </div>
        </div>
      </div>

      {/* performance  */}
      {governor == "performance" && <div>
        <div className="card flex flex-col gap-5">
          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Performance <span className="text-info">Mode Settings</span>
          </p>
          {/* Input */}
          <div className="flex flex-col lg:flex-row w-full gap-4 lg:justify-between pb-4">
            <div className="flex-none lg:pt-2">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                type="number"
                min={0.6}
                max={1.8}
                disabled={cpu?.governor != "performance"}
                unit="GHz"
                value={draft?.performance?.maxFreq}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    performance: {
                      ...prev.performance,
                      maxFreq: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
                    let value = Number(prev.performance.maxFreq);
                    if (prev.performance.maxFreq === "") return prev;
                    value = Math.min(1.8, Math.max(0.6, value));
                    return {
                      ...prev,
                      performance: {
                        ...prev.performance,
                        maxFreq: value,
                      },
                    };
                  });
                }}
              />

              <div>
                <p className="text-warning">*Available Maximum Frequency: 0.6 - 1.8 GHz</p>
              </div>

            </div>
          </div>
          {/* Button  */}
          <ButtonSave disabled={cpu?.governor != "performance" || !disabledButton?.performance} onClick={onSaveGovernor} />
        </div>
      </div>}

      {/* powersave  */}
      {governor == "powersave" && <div>
        <div className="card flex flex-col gap-5">
          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Powersave <span className="text-info">Mode Settings</span>
          </p>
          {/* Input */}
          <div className="flex flex-col lg:flex-row w-full gap-4 lg:justify-between pb-4">
            <div className="flex-none lg:pt-2">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                type="number"
                disabled={cpu?.governor != "powersave"}
                unit="GHz"
                value={draft?.powersave?.minFreq}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    powersave: {
                      ...prev.powersave,
                      minFreq: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
                    let value = Number(prev.powersave.minFreq);
                    if (prev.powersave.minFreq === "") return prev;
                    value = Math.min(1.8, Math.max(0.6, value));
                    return {
                      ...prev,
                      powersave: {
                        ...prev.powersave,
                        minFreq: value,
                      },
                    };
                  });
                }}
                placeholder="Input frequency"
              />
              <div>
                <p className="text-warning">*Available Minimum Frequency: 0.6 - 1.8 GHz</p>
              </div>
            </div>
          </div>
          {/* Button  */}
          <ButtonSave disabled={cpu?.governor != "powersave" || !disabledButton?.powersave} onClick={onSaveGovernor} />
        </div>
      </div>}

      {/* ondemand  */}
      {governor == "ondemand" && <div>
        <div className="card flex flex-col gap-5">

          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Ondemand <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between mb-5">
            <div className="flex-none lg:pt-2">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "ondemand"}
                type="number"
                unit="GHz"
                value={draft?.ondemand?.maxFreq ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    ondemand: {
                      ...prev.ondemand,
                      maxFreq: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
                    let value = Number(prev.ondemand.maxFreq);
                    if (prev.ondemand.maxFreq === "") return prev;
                    value = Math.min(1.8, Math.max(0.6, value));
                    return {
                      ...prev,
                      ondemand: {
                        ...prev.ondemand,
                        maxFreq: value,
                      },
                    };
                  });
                }}
                placeholder="Input frequency"
              />
              <div>
                <p className="text-warning">*Available Maximum Frequency: 0.6 - 1.8 GHz</p>
              </div>
            </div>
          </div>

          {/* Min  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "ondemand"}
                type="number"
                unit="GHz"
                value={draft?.ondemand?.minFreq ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    ondemand: {
                      ...prev.ondemand,
                      minFreq: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
                    let value = Number(prev.ondemand.minFreq);
                    if (prev.ondemand.minFreq === "") return prev;
                    value = Math.min(1.8, Math.max(0.6, value));
                    return {
                      ...prev,
                      ondemand: {
                        ...prev.ondemand,
                        minFreq: value,
                      },
                    };
                  });
                }}
                placeholder="Input frequency"
              />
              <div>
                <p className="text-warning">*Available Minimum Frequency: 0.6 - 1.8 GHz</p>
              </div>
            </div>
          </div>

          {/* Threshold  */}
          <div className="flex flex-col lg:flex-row gap-4 w-full gap-4 lg:justify-between mb-2">
            <div className="flex-none pt-2">
              <p className="text-info">Threshold</p>
            </div>
            <div className="bng-red-100 w-full lg:w-[70%] flex flex-col lg:flex-row lg:justify-between gap-4">
              <div className='flex gap-6'>
                <p className="text-info flex-1/4 pt-2">Up</p>
                <div>
                  <InputWithUnit disabled={cpu?.governor != "ondemand"} type="number" placeholder="Up Threshold" unit="%" value={draft?.ondemand?.thresholdUp ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        ondemand: {
                          ...prev.ondemand,
                          thresholdUp: e.target.value,
                        },
                      }))
                    }
                    onBlur={() => {
                      setDraft((prev) => {
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
                    }} />
                  <p className="text-warning">*Available: 1 - 100%</p>
                </div>
              </div>

              <div className='flex gap-6'>
                <p className="text-info pt-2 flex-1/4">Down</p>
                <div>
                  <InputWithUnit disabled={cpu?.governor != "ondemand"} type="number" placeholder="Down Threshold" unit="%" value={draft?.ondemand?.thresholdDown ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        ondemand: {
                          ...prev.ondemand,
                          thresholdDown: e.target.value,
                        },
                      }))
                    }
                    onBlur={() => {
                      setDraft((prev) => {
                        let value = Number(prev.ondemand.thresholdDown);
                        if (prev.ondemand.thresholdDown === "") return prev;
                        value = Math.min(100, Math.max(1, value));
                        return {
                          ...prev,
                          ondemand: {
                            ...prev.ondemand,
                            thresholdDown: value,
                          },
                        };
                      });
                    }} />
                  <p className="text-warning">*Available: 1 - 100%</p>
                </div>
              </div>
            </div>
          </div>

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
                value={draft?.ondemand?.samplingRate ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    ondemand: {
                      ...prev.ondemand,
                      samplingRate: Number(e.target.value)
                    }
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
                type="number"
                unit="ms"
                value={draft?.ondemand?.samplingDownFactor ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    ondemand: {
                      ...prev.ondemand,
                      samplingDownFactor: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input samping down factor"
              />
            </div>
          </div>

          {/* Ignore Nice Load */}
          <div className="flex flex-col lg:flex-row gap-4 w-full gap-4 lg:items-center lg:justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Ignore Nice Load</p>
            </div>
            <div className="w-[70%] flex gap-12">
              <div className='flex items-center gap-8'>
                <Checkbox
                  disabled={cpu?.governor != "ondemand"}
                  checked={draft?.ondemand?.isIgnoreNice ?? false}
                  onChange={(e) =>
                    setDraft(prev => ({
                      ...prev,
                      ondemand: {
                        ...prev.ondemand,
                        isIgnoreNice: !prev?.ondemand?.isIgnoreNice ?? true
                      }
                    }))
                  }
                />
              </div>
              <div className='flex items-center gap-6'>
                <p className="text-info">I/O Busy</p>
                <Checkbox
                  disabled={cpu?.governor != "ondemand"}
                  checked={draft?.ondemand?.isIoBusy ?? false}
                  onChange={(e) =>
                    setDraft(prev => ({
                      ...prev,
                      ondemand: {
                        ...prev.ondemand,
                        isIoBusy: !prev?.ondemand?.isIoBusy ?? true
                      }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Power Bias  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between">
            <div className="flex-none pt-2">
              <p className="text-info">Power Bias</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "ondemand"}
                type="number"
                unit="%"
                value={draft?.ondemand?.powerBias ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    ondemand: {
                      ...prev.ondemand,
                      powerBias: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
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

          <ButtonSave disabled={cpu?.governor != "ondemand" || !disabledButton?.ondemand} onClick={onSaveGovernor} />
        </div>
      </div>}

      {/* conservative  */}
      {governor == "conservative" && <div>
        <div className="card flex flex-col gap-5">

          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Conservative <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between mb-5">
            <div className="flex-none pt-2">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "conservative"}
                type="number"
                unit="GHz"
                value={draft?.conservative?.maxFreq ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    conservative: {
                      ...prev.conservative,
                      maxFreq: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
                    let value = Number(prev.conservative.maxFreq);
                    if (prev.conservative.maxFreq === "") return prev;
                    value = Math.min(1.8, Math.max(0.6, value));
                    return {
                      ...prev,
                      conservative: {
                        ...prev.conservative,
                        maxFreq: value,
                      },
                    };
                  });
                }}
                placeholder="Input frequency"
              />
              <div>
                <p className="text-warning">*Available Maximum Frequency: 0.6 - 1.8 GHz</p>
              </div>
            </div>
          </div>

          {/* Min  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between mb-5">
            <div className="flex-none pt-2">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "conservative"}
                type="number"
                unit="GHz"
                value={draft?.conservative?.minFreq ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    conservative: {
                      ...prev.conservative,
                      minFreq: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
                    let value = Number(prev.conservative.minFreq);
                    if (prev.conservative.minFreq === "") return prev;
                    value = Math.min(1.8, Math.max(0.6, value));
                    return {
                      ...prev,
                      conservative: {
                        ...prev.conservative,
                        minFreq: value,
                      },
                    };
                  });
                }}
                placeholder="Input frequency"
              />
              <div>
                <p className="text-warning">*Available Minimum Frequency: 0.6 - 1.8 GHz</p>
              </div>
            </div>
          </div>

          {/* Threshold  */}
          <div className="flex flex-col lg:flex-row gap-4 w-full gap-4 lg:justify-between mb-2">
            <div className="flex-none pt-2">
              <p className="text-info">Threshold</p>
            </div>
            <div className="bng-red-100 w-full lg:w-[70%] flex flex-col lg:flex-row lg:justify-between gap-4">
              <div className='flex gap-6'>
                <p className="text-info pt-2 flex-1/4">Up</p>
                <div>
                  <InputWithUnit disabled={cpu?.governor != "conservative"} type="number" value={draft?.conservative?.thresholdUp ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        conservative: {
                          ...prev.conservative,
                          thresholdUp: e.target.value,
                        },
                      }))
                    }
                    onBlur={() => {
                      setDraft((prev) => {
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
                    placeholder="Up Threshold" unit="%" />
                  <p className="text-warning">*Available: 1 - 100%</p>
                </div>
              </div>
              <div className='flex gap-6'>
                <p className="text-info flex-1/4 pt-2">Down</p>
                <div>
                  <InputWithUnit disabled={cpu?.governor != "conservative"} type="number" value={draft?.conservative?.thresholdDown ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        conservative: {
                          ...prev.conservative,
                          thresholdDown: e.target.value,
                        },
                      }))
                    }
                    onBlur={() => {
                      setDraft((prev) => {
                        let value = Number(prev.conservative.thresholdDown);
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
                    placeholder="Down Threshold" unit="%" />
                  <p className="text-warning">*Available: 1 - 100%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sampling Rate  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between">
            <div className="flex-none">
              <p className="text-info">Sampling Rate</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "conservative"}
                type="number"
                unit="ms"
                value={draft?.conservative?.samplingRate ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    conservative: {
                      ...prev.conservative,
                      samplingRate: Number(e.target.value)
                    }
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
              <InputWithUnit disabled={cpu?.governor != "conservative"}
                type="number"
                unit="ms"
                value={draft?.conservative?.samplingDownFactor ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    conservative: {
                      ...prev.conservative,
                      samplingDownFactor: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input samping down factor"
              />
            </div>
          </div>

          {/* Ignore Nice Load */}
          <div className="flex flex-col lg:flex-row gap-4 w-full gap-4 lg:items-center lg:justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Ignore Nice Load</p>
            </div>
            <div className="w-[70%] flex gap-12">
              <div className='flex items-center gap-8'>
                <Checkbox disabled={cpu?.governor != "conservative"}
                  checked={draft?.conservative?.isIgnoreNice ?? false}
                  onChange={(e) =>
                    setDraft(prev => ({
                      ...prev,
                      conservative: {
                        ...prev.conservative,
                        isIgnoreNice: !prev?.conservative?.isIgnoreNice ?? true
                      }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Frequency Step  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between">
            <div className="flex-none pt-2">
              <p className="text-info">Frequency Step</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "conservative"}
                type="number"
                unit="%"
                value={draft?.conservative?.frequencyStep ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    conservative: {
                      ...prev.conservative,
                      frequencyStep: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
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

          <ButtonSave disabled={cpu?.governor != "conservative" || !disabledButton?.conservative} onClick={onSaveGovernor} />
        </div>
      </div>}

      {/* schedutil  */}
      {governor == "schedutil" && <div>
        <div className="card flex flex-col gap-5">

          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Schedutil <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between mb-5">
            <div className="flex-none pt-2">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "schedutil"}
                type="number"
                unit="GHz"
                value={draft?.schedutil?.maxFreq ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    schedutil: {
                      ...prev.schedutil,
                      maxFreq: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
                    let value = Number(prev.schedutil.maxFreq);
                    if (prev.schedutil.maxFreq === "") return prev;
                    value = Math.min(1.8, Math.max(0.6, value));
                    return {
                      ...prev,
                      schedutil: {
                        ...prev.schedutil,
                        maxFreq: value,
                      },
                    };
                  });
                }}
                placeholder="Input frequency"
              />
              <p className="text-warning">*Available Maximum Frequency: 0.6 - 1.8 GHz</p>
            </div>
          </div>

          {/* Min  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between mb-5">
            <div className="flex-none pt-2">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "schedutil"}
                type="number"
                unit="GHz"
                value={draft?.schedutil?.minFreq ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    schedutil: {
                      ...prev.schedutil,
                      minFreq: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
                    let value = Number(prev.schedutil.minFreq);
                    if (prev.schedutil.minFreq === "") return prev;
                    value = Math.min(1.8, Math.max(0.6, value));
                    return {
                      ...prev,
                      schedutil: {
                        ...prev.schedutil,
                        minFreq: value,
                      },
                    };
                  });
                }}
                placeholder="Input frequency"
              />
              <p className="text-warning">*Available Minimum Frequency: 0.6 - 1.8 GHz</p>
            </div>
          </div>

          {/* Rate Limit  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between">
            <div className="flex-none">
              <p className="text-info">Rate Limit</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "schedutil"}
                type="number"
                unit="ms"
                value={draft?.schedutil?.rateLimit ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    schedutil: {
                      ...prev.schedutil,
                      rateLimit: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input rate limit"
              />
            </div>
          </div>

          <ButtonSave disabled={cpu?.governor != "schedutil" || !disabledButton?.schedutil} onClick={onSaveGovernor} />
        </div>
      </div>}

      {/* userspace  */}
      {governor == "userspace" && <div>
        <div className="card flex flex-col gap-5">

          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Userspace <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between mb-5">
            <div className="flex-none pt-2">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "userspace"}
                type="number"
                unit="GHz"
                value={draft?.userspace?.maxFreq ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    userspace: {
                      ...prev.userspace,
                      maxFreq: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
                    let value = Number(prev.userspace.maxFreq);
                    if (prev.userspace.maxFreq === "") return prev;
                    value = Math.min(1.8, Math.max(0.6, value));
                    return {
                      ...prev,
                      userspace: {
                        ...prev.userspace,
                        maxFreq: value,
                      },
                    };
                  });
                }}
                placeholder="Input frequency"
              />
              <p className="text-warning">*Available Maximum Frequency: 0.6 - 1.8 GHz</p>
            </div>
          </div>

          {/* Min  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between mb-5">
            <div className="flex-none pt-2">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "userspace"}
                type="number"
                unit="GHz"
                value={draft?.userspace?.minFreq ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    userspace: {
                      ...prev.userspace,
                      minFreq: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
                    let value = Number(prev.userspace.minFreq);
                    if (prev.userspace.minFreq === "") return prev;
                    value = Math.min(1.8, Math.max(0.6, value));
                    return {
                      ...prev,
                      userspace: {
                        ...prev.userspace,
                        minFreq: value,
                      },
                    };
                  });
                }}
                placeholder="Input frequency"
              />
              <p className="text-warning">*Available Minimum Frequency: 0.6 - 1.8 GHz</p>
            </div>
          </div>

          {/* Fixed Frequency  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:justify-between">
            <div className="flex-none pt-2">
              <p className="text-info">Fixed Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "userspace"}
                type="number"
                unit="GHz"
                value={draft?.userspace?.fixedFrequency ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    userspace: {
                      ...prev.userspace,
                      fixedFrequency: e.target.value,
                    },
                  }))
                }
                onBlur={() => {
                  setDraft((prev) => {
                    let value = Number(prev.userspace.fixedFrequency);
                    if (prev.userspace.fixedFrequency === "") return prev;
                    value = Math.min(1.8, Math.max(0.6, value));
                    return {
                      ...prev,
                      userspace: {
                        ...prev.userspace,
                        fixedFrequency: value,
                      },
                    };
                  });
                }}
                placeholder="Input fixed frequency"
              />
              <p className="text-warning">*Available Frequency: 0.6 - 1.8 GHz</p>
            </div>
          </div>

          <div>
            <div className='flex gap-2 items-center' >
              <Checkbox disabled={cpu?.governor != "userspace"}
                checked={draft?.userspace?.isDynamicScripting ?? false}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    userspace: {
                      ...prev.userspace,
                      isDynamicScripting: !prev?.userspace?.isDynamicScripting ?? true
                    }
                  }))
                }
              />
              <p className='text-info'>Dynamic Scripting</p>
            </div>

            <div className='flex flex-col lg:flex-row gap-4 pt-4'>
              <div className='flex-1'>
                <ScriptEditor
                  disabled={!draft?.userspace?.isDynamicScripting ?? true | cpu?.governor != "userspace"}
                  value={script}
                  onChange={setScript}
                  onSave={() => {
                    console.log(script);
                  }}
                />
              </div>
              <div className='flex-1'>
                <ScriptReference />
              </div>
            </div>
          </div>

          <ButtonSave disabled={cpu?.governor != "userspace" || !disabledButton?.userspace} onClick={onSaveGovernor} />
        </div>
      </div>}

      {/* Log  */}
      <Log value={log} />

      {/* Thread & Core  */}
      <div className='pt-8'>

        {/* Title  */}
        <h1 className="text-xtitle">
          Thread Allocation & Core Pinning
        </h1>

        <p className="text-subinfo mt-2 text-gray-500">
          Optimize performance by assigning processes to specific CPU cores and managing thread distribution.
        </p>

        {/* Card  */}
        <div className='flex flex-col lg:flex-row pt-4 justify-between gap-4 h-full'>
          <div className="card flex-1">
            <div className='flex flex-col justify-between h-full pb-1 gap-4'>
              <p className="text-info" style={{ fontWeight: "bold" }}>Thread Allocation</p>
              <div>
                <InputWithUnit
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
              <ButtonSave disabled={cpu?.thread === threadDraft || threadDraft == ""} onClick={onSaveThread} />
            </div>
          </div>

          <div className="card flex-1">
            <div className='flex flex-col justify-between gap-4 h-full pb-1 gap-4'>
              <p className="text-info" style={{ fontWeight: "bold" }}>Core Pinning</p>
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
              <ButtonSave disabled={cpu?.core === coreDraft || coreDraft?.length == 0} onClick={onSaveCore} />
            </div>
          </div>
        </div>
        <Log value={log2} />
      </div>
    </div>
  )
}