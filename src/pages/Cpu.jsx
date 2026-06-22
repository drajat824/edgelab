import { useState } from 'react'
import Dropdown from '../components/Dropdown'
import InputWithUnit from '../components/TextInput'
import Log from '../components/Log';
import RadioButton from '../components/RadioButton';
import Checkbox from '../components/Checkbox';
import ScriptReference from '../components/ScriptReference'
import ScriptEditor from '../components/ScriptEditor'

export default function Cpu() {

  const [governor, setGovernor] = useState('Performance');
  const [ignoreNiceLoad, setIgnoreNiceLoad] = useState(false);
  const [IOBusy, setIOBusy] = useState(false);
  const [dynamic, setDynamic] = useState(true);
  const [script, setScript] = useState("")

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
      <div className='flex gap-4'>
        <div className="flex-none flex items-center py-4 gap-12">
          <p className="text-info">CPU Governor</p>
          <Dropdown
            value={governor}
            onChange={setGovernor}
            options={['Performance', 'Powersave', 'Ondemand', 'Conservative', 'Schedutil', 'Userspace']}
            width="w-48"
          />
        </div>
        <div className='flex-1 flex justify-between items-center'>
          <button style={{ color: 'white' }} className='btn bg-blue-500 hover:bg-blue-700 text-subinfo'>
            CHANGE
          </button>
          {/* <p className='text-info'>Governor Mode active: <span style={{ fontWeight: "bold" }}>Performance</span></p> */}
          <div className="rounded-md px-2 py-2">
            <p className="text-sm text-black-500">
              Governor Mode Active
            </p>
            <p className="text-xl font-semibold text-green-700">
              Performance
            </p>
          </div>
        </div>

      </div>

      {/* Performance  */}
      {governor == "Performance" && <div>
        <div className="card flex flex-col gap-5">
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Performance <span className="text-info">Mode Settings</span>
          </p>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-[70%]">
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
          <button className="btn-primary text-white w-32">
            <p className="text-info">SAVE</p>
          </button>
        </div>
      </div>}

      {/* Powersave  */}
      {governor == "Powersave" && <div>
        <div className="card flex flex-col gap-5">
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Powersave <span className="text-info">Mode Settings</span>
          </p>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between">
            <div className="flex-none">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Minimum Frequency: 0.6 GHz</p>
            </div>
          </div>
          <button className="btn-primary text-white w-32">
            <p className="text-info">SAVE</p>
          </button>
        </div>
      </div>}

      {/* Ondemand  */}
      {governor == "Ondemand" && <div>
        <div className="card flex flex-col gap-5">
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Ondemand <span className="text-info">Mode Settings</span>
          </p>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-[70%]">
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
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Minimum Frequency: 0.6 GHz</p>
            </div>
          </div>

          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Threshold</p>
            </div>
            <div className="w-[70%] flex justify-between">
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
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Sampling Rate</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="ms"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input sampling rate"
              />
            </div>
          </div>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Sampling Down Factor</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="ms"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input sampling down factor"
              />
            </div>
          </div>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Ignore Nice Load</p>
            </div>
            <div className="w-[70%] flex gap-12">
              <div className='flex items-center gap-8'>
                <Checkbox
                  checked={ignoreNiceLoad}
                  onChange={setIgnoreNiceLoad}
                />
              </div>
              <div className='flex items-center gap-6'>
                <p className="text-info">I/O Busy</p>
                <Checkbox
                  checked={IOBusy}
                  onChange={setIOBusy}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Power Bias</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="%"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input sampling down factor"
              />
            </div>
          </div>

          <button className="btn-primary text-white w-32">
            <p className="text-info">SAVE</p>
          </button>
        </div>
      </div>}

      {/* Conservative  */}
      {governor == "Conservative" && <div>
        <div className="card flex flex-col gap-5">
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Conservative <span className="text-info">Mode Settings</span>
          </p>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-[70%]">
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
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Minimum Frequency: 0.6 GHz</p>
            </div>
          </div>

          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Threshold</p>
            </div>
            <div className="w-[70%] flex justify-between">
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
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Sampling Rate</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="ms"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input sampling rate"
              />
            </div>
          </div>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Sampling Down Factor</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="ms"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input sampling down factor"
              />
            </div>
          </div>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Ignore Nice Load</p>
            </div>
            <div className="w-[70%] flex gap-12">
              <div className='flex items-center gap-8'>
                <Checkbox
                  checked={ignoreNiceLoad}
                  onChange={setIgnoreNiceLoad}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-2">
            <div className="flex-none">
              <p className="text-info">Frequency Step</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="%"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input frequency step"
              />
            </div>
          </div>

          <button className="btn-primary text-white w-32">
            <p className="text-info">SAVE</p>
          </button>
        </div>
      </div>}

      {/* Schedutil  */}
      {governor == "Schedutil" && <div>
        <div className="card flex flex-col gap-5">
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Schedutil <span className="text-info">Mode Settings</span>
          </p>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-[70%]">
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
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Minimum Frequency: 0.6 GHz</p>
            </div>
          </div>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between">
            <div className="flex-none">
              <p className="text-info">Rate Limit</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="ms"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input rate limit"
              />
            </div>
          </div>

          <button className="btn-primary text-white w-32">
            <p className="text-info">SAVE</p>
          </button>
        </div>
      </div>}

      {/* Userspace  */}
      {governor == "Userspace" && <div>
        <div className="card flex flex-col gap-5">
          <p className="text-info" style={{ fontWeight: 'bold' }}>
            Userspace <span className="text-info">Mode Settings</span>
          </p>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Maximum Frequency</p>
            </div>
            <div className="w-[70%]">
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
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between mb-5">
            <div className="flex-none">
              <p className="text-info">Scalling Minimum Frequency</p>
            </div>
            <div className="w-[70%]">
              <InputWithUnit
                type="number"
                unit="GHz"
                // value={temp}
                // onChange={(e) => setTemp(e.target.value)}
                placeholder="Input frequency"
              />
              <p className="text-warning absolute">*Available Minimum Frequency: 0.6 GHz</p>
            </div>
          </div>
          <div className="flex flex-row gap-4 w-full gap-4 items-center justify-between">
            <div className="flex-none">
              <p className="text-info">Fixed Frquency</p>
            </div>
            <div className="w-[70%]">
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
                checked={dynamic}
                onChange={setDynamic}
              />
              <p className='text-info'>Dynamic Scripting</p>
            </div>

            <div className='flex gap-4 pt-4'>
              <div className='flex-1'>
                <ScriptEditor
                  disabled={!dynamic}
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

          <button className="btn-primary text-white w-32">
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

        <div className='flex pt-4 justify-between gap-4'>

          <div className='flex-1'>
            <div className="card">
              <div className='flex flex-col h-[150px] justify-between'>
                <p className="text-info">Thread Allocation</p>
                <div>
                  <InputWithUnit
                    type="number"
                    // value={temp}
                    // onChange={(e) => setTemp(e.target.value)}
                    placeholder="Input thread"
                  />
                </div>
                <button className="btn-primary text-white w-32">
                  <p className="text-info">SAVE</p>
                </button>
              </div>
            </div>
            {/* Log  */}
            <Log value="taskset -c 0, 1,2,3  python app.py" />
          </div>

          <div className='flex-1'>
            <div className="card">
              <div className='flex flex-col h-[150px] justify-between'>
                <p className="text-info">Core Pinning</p>
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
                <button className="btn-primary text-white w-32">
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