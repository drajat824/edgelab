import { useEffect, useState } from 'react'
import Dropdown from '../components/Dropdown'
import InputWithUnit from '../components/TextInput'
import Log from '../components/Log';
import RadioButton from '../components/RadioButton';
import Checkbox from '../components/Checkbox';
import ScriptReference from '../components/ScriptReference'
import ScriptEditor from '../components/ScriptEditor'
import ButtonSave from '../components/ButtonSave'

// State Management
import useCPU from "../hooks/useCPU"

export default function Cpu() {

  const { cpu, dispatch } = useCPU();
  const [script, setScript] = useState("");

  const [draft, setDraft] = useState({
    governor: "",
    minFreq: null,
    maxFreq: null,
    config: {}
  });

  useEffect(() => {
    if (!cpu?.governor) return;
    setDraft({
      governor: cpu?.governor,
      minFreq: cpu?.minFreq,
      maxFreq: cpu?.maxFreq,
      config: { ...cpu[cpu?.governor] }
    });
  }, [cpu?.governor]);

  const onSaveGovernor = () => {
    dispatch({
      type: "CHANGE_GOVERNOR",
      payload: draft
    })
  }

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
            value={draft?.governor}
            onChange={(e) => setDraft((prev) => ({ ...prev, governor: e }))}
            options={['Performance', 'Powersave', 'Ondemand', 'Conservative', 'Schedutil', 'Userspace']}
            width="w-48"
          />
        </div>
        <div className='flex-1 flex flex-col lg:flex-row lg:justify-between lg:items-center'>

          {/* Button Change */}
          <button onClick={onSaveGovernor} style={{ color: 'white' }} className='btn bg-blue-500 hover:bg-blue-700 text-subinfo ml-0 lg:ml-4'>
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

      {/* Performance  */}
      {draft.governor == "Performance" && <div>
        <div className="card flex flex-col gap-5">
          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Performance <span className="text-info">Mode Settings</span>
          </p>
          {/* Input */}
          <div className="flex flex-col lg:flex-row w-full gap-4 lg:items-center lg:justify-between pb-4">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                type="number"
                disabled={cpu?.governor != "Performance"}
                unit="GHz"
                value={draft.maxFreq}
                onChange={(e) => setDraft((prev) => ({
                  ...prev,
                  maxFreq: e.target.value
                }))}
                placeholder="Input frequency"
              />
              <p className="text-warning">*Available Maximum Frequency: 1.8 GHz</p>
            </div>
          </div>
          {/* Button  */}
          <ButtonSave disabled={cpu?.governor != "Performance"} onClick={onSaveGovernor} />
        </div>
      </div>}

      {/* Powersave  */}
      {draft.governor == "Powersave" && <div>
        <div className="card flex flex-col gap-5">
          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Powersave <span className="text-info">Mode Settings</span>
          </p>
          {/* Input */}
          <div className="flex flex-col lg:flex-row w-full gap-4 lg:items-center lg:justify-between pb-4">
            <div className="flex-none">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                type="number"
                disabled={cpu?.governor != "Powersave"}
                unit="GHz"
                value={draft.minFreq}
                onChange={(e) => setDraft((prev) => ({
                  ...prev,
                  minFreq: e.target.value
                }))}
                placeholder="Input frequency"
              />
              <p className="text-warning">*Available Minimum Frequency: 1.8 GHz</p>
            </div>
          </div>
          {/* Button  */}
          <ButtonSave disabled={cpu?.governor != "Powersave"} onClick={onSaveGovernor} />
        </div>
      </div>}

      {/* Ondemand  */}
      {draft.governor == "Ondemand" && <div>
        <div className="card flex flex-col gap-5">

          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Ondemand <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                disabled={cpu?.governor != "Ondemand"}
                type="number"
                unit="GHz"
                value={draft.maxFreq}
                onChange={(e) => setDraft((prev) => ({ ...prev, maxFreq: e.target.value }))}
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
                disabled={cpu?.governor != "Ondemand"}
                type="number"
                unit="GHz"
                value={draft.minFreq}
                onChange={(e) => setDraft((prev) => ({ ...prev, minFreq: e.target.value }))}
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
                <InputWithUnit disabled={cpu?.governor != "Ondemand"} type="number" placeholder="Up Threshold" unit="%" value={draft?.config?.thresholdUp}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        thresholdUp: Number(e.target.value),
                      },
                    }))
                  } />
              </div>
              <div className='flex items-center gap-6'>
                <p className="text-info">Down</p>
                <InputWithUnit disabled={cpu?.governor != "Ondemand"} type="number" placeholder="Down Threshold" unit="%" value={draft?.config?.thresholdDown}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        thresholdDown: Number(e.target.value),
                      },
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
                disabled={cpu?.governor != "Ondemand"}
                type="number"
                unit="ms"
                value={draft?.config?.samplingRate || null}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    config: {
                      ...prev.config,
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
                disabled={cpu?.governor != "Ondemand"}
                type="number"
                unit="ms"
                value={draft?.config?.samplingDownFactor || null}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    config: {
                      ...prev.config,
                      samplingDownFactor: Number(e.target.value),
                    },
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
                  disabled={cpu?.governor != "Ondemand"}
                  checked={draft?.config?.isIgnoreNice || false}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        isIgnoreNice: !prev.config.isIgnoreNice,
                      },
                    }))
                  }
                />
              </div>
              <div className='flex items-center gap-6'>
                <p className="text-info">I/O Busy</p>
                <Checkbox
                  disabled={cpu?.governor != "Ondemand"}
                  checked={draft?.config?.isIoBusy || false}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        isIoBusy: !prev.config.isIoBusy,
                      },
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
                disabled={cpu?.governor != "Ondemand"}
                type="number"
                unit="%"
                value={draft?.config?.powerBias || null}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    config: {
                      ...prev.config,
                      powerBias: Number(e.target.value),
                    },
                  }))
                }
                placeholder="Input power bias"
              />
            </div>
          </div>

          <ButtonSave disabled={cpu?.governor != "Ondemand"} onClick={onSaveGovernor} />
        </div>
      </div>}

      {/* Conservative  */}
      {draft.governor == "Conservative" && <div>
        <div className="card flex flex-col gap-5">

          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Conservative <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
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
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
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
                <InputWithUnit type="number" placeholder="Up Threshold" unit="%" />
              </div>
              <div className='flex items-center gap-6'>
                <p className="text-info">Down</p>
                <InputWithUnit type="number" placeholder="Down Threshold" unit="%" />
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
                type="number"
                unit="ms"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
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
                type="number"
                unit="ms"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
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
                  checked={configGovernor.isIgnoreNice}
                  onChange={() => setConfigGovernor((prev) => ({ ...prev, isIgnoreNice: !prev.isIgnoreNice }))}
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
              <InputWithUnit
                type="number"
                unit="%"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input frequency step"
              />
            </div>
          </div>

          <button className="btn-primary text-white w-full lg:w-32">
            <p className="text-info">SAVE</p>
          </button>
        </div>
      </div>}

      {/* Schedutil  */}
      {draft.governor == "Schedutil" && <div>
        <div className="card flex flex-col gap-5">

          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Schedutil <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
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
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
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
              <InputWithUnit
                type="number"
                unit="ms"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input rate limit"
              />
            </div>
          </div>

          <button className="btn-primary text-white w-full lg:w-32">
            <p className="text-info">SAVE</p>
          </button>
        </div>
      </div>}

      {/* Userspace  */}
      {draft.governor == "Userspace" && <div>
        <div className="card flex flex-col gap-5">

          {/* Label  */}
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Userspace <span className="text-info">Mode Settings</span>
          </p>

          {/* Max  */}
          <div className="flex flex-col lg:flex-row w-full gap-4 w-full gap-4 lg:items-center lg:justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-full lg:w-[70%]">
              <InputWithUnit
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
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
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
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
              <InputWithUnit
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input fixed frequency"
              />
            </div>
          </div>

          <div>
            <div className='flex gap-2 items-center' >
              <Checkbox
                checked={configGovernor.isDynamicScripting}
                onChange={() => setConfigGovernor((prev) => ({ ...prev, isDynamicScripting: !prev.isDynamicScripting }))}
              />
              <p className='text-info'>Dynamic Scripting</p>
            </div>

            <div className='flex flex-col lg:flex-row gap-4 pt-4'>
              <div className='flex-1'>
                <ScriptEditor
                  disabled={!configGovernor.isDynamicScripting}
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

          <button className="btn-primary text-white w-full lg:w-32">
            <p className="text-info">SAVE</p>
          </button>
        </div>
      </div>}

      {/* Log  */}
      <Log value="echo 1800000 | sudo tee /sys/devices/system/cpu/cpu0/cpufreq/scaling_max_freq" />

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