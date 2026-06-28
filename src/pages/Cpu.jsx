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

  // Governor yang dipilih
  const [governor, setGovernor] = useState(cpu.governor);

  // Data yang sedang diedit
  const [draft, setDraft] = useState({});
  console.log(draft)

  // Data asli sebagai pembanding
  const [originalDraft, setOriginalDraft] = useState({});

  // Status perubahan setiap field
  const [status, setStatus] = useState({});

  // Script/log command
  const [log, setLog] = useState("");
  
  // Script - Userspace
  const [script, setScript] = useState("")

  /**
   * Membandingkan original dengan draft
   * Menghasilkan object boolean untuk setiap field yang berubah
   */
  function getChangedFields(original, draft) {
    const changed = {
      governor: original.governor !== governor,
    };

    Object.entries(draft).forEach(([key, value]) => {
      // governor sudah dicek di atas
      if (key === "governor") return;

      // hanya proses object
      if (typeof value !== "object" || value === null) return;

      changed[key] = {};

      Object.keys(value).forEach((field) => {
        changed[key][field] =
          original[key][field] !== value[field];
      });
    });

    return changed;
  }

  /**
   * Mengambil data CPU dari Context
   * Simpan sebagai original dan draft
   */
  useEffect(() => {
    if (!cpu) return;

    const clone = structuredClone(cpu);

    setDraft(clone);
    setOriginalDraft(clone);
  }, [cpu]);

  /**
   * Hitung perubahan setiap kali draft berubah
   */
  useEffect(() => {
    if (!Object.keys(originalDraft).length) return;

    setStatus(getChangedFields(originalDraft, draft));
  }, [draft, originalDraft, governor]);

  /**
   * Status tombol Save.
   * true = ada perubahan
   * false = tidak ada perubahan
   *
   * Tidak perlu disimpan ke state karena selalu
   * bisa dihitung dari status.
   */
  const disabledButton = useMemo(() => {
    return Object.fromEntries(
      Object.entries(status).map(([key, value]) => [
        key,
        typeof value === "boolean"
          ? value
          : Object.values(value).some(Boolean),
      ])
    );
  }, [status]);

  /**
   * Simpan konfigurasi governor
   */
  const onSaveGovernor = () => {
    const command = generateCommandFunction({
      status,
      draft,
    });

    setLog(command);

    dispatch({
      type: "SAVE_GOVERNOR_CONFIG",
      payload: {
        governor,
        config: draft,
      },
    });
  };

  /**
   * Ganti governor
   */
  const onChangeGovernor = () => {
    if (governor !== originalDraft.governor) {
      const newStatus = {
        ...status,
        governor: true,
      };

      const newDraft = {
        ...draft,
        governor,
      };

      const command = generateCommandFunction({
        status: newStatus,
        draft: newDraft,
      });

      setLog(command);
    }

    dispatch({
      type: "CHANGE_GOVERNOR",
      payload: governor,
    });
  };

  return (
    <div className="parent">
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
          <button onClick={onChangeGovernor} style={{ color: 'white' }} className='btn bg-blue-500 hover:bg-blue-700 text-subinfo ml-0 lg:ml-4'>
            CHANGE
          </button>

          {/* Governor Info  */}
          <div className="rounded-md px-2 py-2">
            <p className="text-sm text-black-500">
              Governor Mode Active
            </p>
            <p className="text-xl font-semibold text-green-700">
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
            performance <span className="text-info">Mode Settings</span>
          </p>
          {/* Input */}
          <div className="flex flex-col lg:flex-row w-full gap-4 lg:items-center lg:justify-between pb-4">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                type="number"
                disabled={cpu?.governor != "performance"}
                unit="GHz"
                value={draft?.performance?.maxFreq}
                onChange={(e) => setDraft((prev) => ({
                  ...prev,
                  performance: { maxFreq: Number(e.target.value) }
                }))}
                placeholder="Input frequency"
              />
              <p className="text-warning">*Available Maximum Frequency: 1.8 GHz</p>
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
            powersave <span className="text-info">Mode Settings</span>
          </p>
          {/* Input */}
          <div className="flex flex-col lg:flex-row w-full gap-4 lg:items-center lg:justify-between pb-4">
            <div className="flex-none">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                type="number"
                disabled={cpu?.governor != "powersave"}
                unit="GHz"
                value={draft?.powersave?.minFreq}
                onChange={(e) => setDraft((prev) => ({
                  ...prev,
                  powersave: { minFreq: Number(e.target.value) }
                }))}
                placeholder="Input frequency"
              />
              <p className="text-warning">*Available Minimum Frequency: 1.8 GHz</p>
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
            ondemand <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "ondemand"}
                type="number"
                unit="GHz"
                value={draft?.ondemand?.maxFreq ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    ondemand: {
                      ...prev.ondemand,
                      maxFreq: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Maximum Frequency: 1.8 GHz</p>
            </div>
          </div>

          {/* Min  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
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
                  setDraft(prev => ({
                    ...prev,
                    ondemand: {
                      ...prev.ondemand,
                      minFreq: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Maximum Frequency: 1.8 GHz</p>
            </div>
          </div>

          {/* Threshold  */}
          <div className="flex flex-col lg:flex-row gap-4 w-full gap-4 lg:items-center lg:justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Threshold</p>
            </div>
            <div className="bng-red-100 w-full lg:w-[70%] flex flex-col lg:flex-row lg:justify-between gap-4">
              <div className='flex items-center gap-8'>
                <p className="text-info">Up</p>
                <InputWithUnit disabled={cpu?.governor != "ondemand"} type="number" placeholder="Up Threshold" unit="%" value={draft?.ondemand?.thresholdUp ?? ""}
                  onChange={(e) =>
                    setDraft(prev => ({
                      ...prev,
                      ondemand: {
                        ...prev.ondemand,
                        thresholdUp: Number(e.target.value)
                      }
                    }))
                  } />
              </div>
              <div className='flex items-center gap-6'>
                <p className="text-info">Down</p>
                <InputWithUnit disabled={cpu?.governor != "ondemand"} type="number" placeholder="Down Threshold" unit="%" value={draft?.ondemand?.thresholdDown ?? ""}
                  onChange={(e) =>
                    setDraft(prev => ({
                      ...prev,
                      ondemand: {
                        ...prev.ondemand,
                        thresholdDown: Number(e.target.value)
                      }
                    }))
                  } />
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
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between">
            <div className="flex-none">
              <p className="text-info">Power Bias</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "ondemand"}
                type="number"
                unit="%"
                value={draft?.ondemand?.powerBias ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    ondemand: {
                      ...prev.ondemand,
                      powerBias: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input power bias"
              />
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
            conservative <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "conservative"}
                type="number"
                unit="GHz"
                value={draft?.conservative?.maxFreq ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    conservative: {
                      ...prev.conservative,
                      maxFreq: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Maximum Frequency: 1.8 GHz</p>
            </div>
          </div>

          {/* Min  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "conservative"}
                type="number"
                unit="GHz"
                value={draft?.conservative?.minFreq ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    conservative: {
                      ...prev.conservative,
                      minFreq: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Maximum Frequency: 1.8 GHz</p>
            </div>
          </div>

          {/* Threshold  */}
          <div className="flex flex-col lg:flex-row gap-4 w-full gap-4 lg:items-center lg:justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Threshold</p>
            </div>
            <div className="bng-red-100 w-full lg:w-[70%] flex flex-col lg:flex-row lg:justify-between gap-4">
              <div className='flex items-center gap-8'>
                <p className="text-info">Up</p>
                <InputWithUnit disabled={cpu?.governor != "conservative"} type="number" value={draft?.conservative?.thresholdUp ?? ""}
                  onChange={(e) =>
                    setDraft(prev => ({
                      ...prev,
                      conservative: {
                        ...prev.conservative,
                        thresholdUp: Number(e.target.value)
                      }
                    }))
                  } placeholder="Up Threshold" unit="%" />
              </div>
              <div className='flex items-center gap-6'>
                <p className="text-info">Down</p>
                <InputWithUnit disabled={cpu?.governor != "conservative"} type="number" value={draft?.conservative?.thresholdDown ?? ""}
                  onChange={(e) =>
                    setDraft(prev => ({
                      ...prev,
                      conservative: {
                        ...prev.conservative,
                        thresholdDown: Number(e.target.value)
                      }
                    }))
                  } placeholder="Down Threshold" unit="%" />
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
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between">
            <div className="flex-none">
              <p className="text-info">Frequency Step</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "conservative"}
                type="number"
                unit="%"
                value={draft?.conservative?.frequencyStep ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    conservative: {
                      ...prev.conservative,
                      frequencyStep: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input frequency step"
              />
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
            schedutil <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "schedutil"}
                type="number"
                unit="GHz"
                value={draft?.schedutil?.maxFreq ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    schedutil: {
                      ...prev.schedutil,
                      maxFreq: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Maximum Frequency: 1.8 GHz</p>
            </div>
          </div>

          {/* Min  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "schedutil"}
                type="number"
                unit="GHz"
                value={draft?.schedutil?.minFreq ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    schedutil: {
                      ...prev.schedutil,
                      minFreq: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Maximum Frequency: 1.8 GHz</p>
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
            userspace <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "userspace"}
                type="number"
                unit="GHz"
                value={draft?.userspace?.maxFreq ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    userspace: {
                      ...prev.userspace,
                      maxFreq: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Maximum Frequency: 1.8 GHz</p>
            </div>
          </div>

          {/* Min  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "userspace"}
                type="number"
                unit="GHz"
                value={draft?.userspace?.minFreq ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    userspace: {
                      ...prev.userspace,
                      minFreq: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Minimum Frequency: 0.66 GHz</p>
            </div>
          </div>

          {/* Rate Limit  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between">
            <div className="flex-none">
              <p className="text-info">Fixed Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit disabled={cpu?.governor != "userspace"}
                type="number"
                unit="GHz"
                value={draft?.userspace?.fixedFrequency ?? ""}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    userspace: {
                      ...prev.userspace,
                      fixedFrequency: Number(e.target.value)
                    }
                  }))
                }
                placeholder="Input fixed frequency"
              />
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
        <div className='flex flex-col lg:flex-row pt-4 justify-between gap-4'>

          <div className='flex-1'>
            <div className="card">
              <div className='flex flex-col h-[150px] justify-between'>
                <p className="text-info" style={{ fontWeight: "bold" }}>Thread Allocation</p>
                <div>
                  <InputWithUnit
                    type="number"
                    // value={temp}
                    // onChange={(e) => setTemp(e.target.value)}
                    placeholder="Input thread"
                  />
                </div>
                <button className="btn-primary text-white w-full lg:w-32">
                  <p className="text-info">SAVE</p>
                </button>
              </div>
            </div>
            {/* Log  */}
            <Log value="taskset -c 0, 1,2,3  python app.py" />
          </div>

          <div className='flex-1'>
            <div className="card">
              <div className='flex flex-col min-h-[150px] justify-between gap-4'>
                <p className="text-info" style={{ fontWeight: "bold" }}>Core Pinning</p>
                <div>
                  <RadioButton
                    name="mode"
                    // value={mode}
                    // onChange={setMode}
                    options={[
                      { label: "Core 0", value: "0" },
                      { label: "Core 1", value: "1" },
                      { label: "Core 2", value: "2" },
                      { label: "Core 3", value: "3" },
                    ]}
                  />
                </div>
                <button className="btn-primary text-white w-full lg:w-32">
                  <p className="text-info">SAVE</p>
                </button>
              </div>
            </div>

            {/* Log  */}
            <Log value="taskset -c 0, 1,2,3  python app.py" />
          </div>

        </div>
      </div>

    </div>
  )
}