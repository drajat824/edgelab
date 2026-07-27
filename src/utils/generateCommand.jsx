function generateGovernor({ status, governor }) {
  const output = [];
  if (status?.governor && governor) {
    output.push({
      label: "Change Governor",
      command: `echo ${governor} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`,
    });
  }
  return output;
}

function generateStatus({ status, freqDraft }) {
  const output = [];
  if (!freqDraft) return output;

  if (status?.freq?.min && freqDraft.min) {
    const minKHz = parseFloat(freqDraft.min) * 1000000;
    output.push({
      label: "Min Frequency",
      command: `echo ${minKHz} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`,
    });
  }

  if (status?.freq?.max && freqDraft.max) {
    const maxKHz = parseFloat(freqDraft.max) * 1000000;
    output.push({
      label: "Max Frequency",
      command: `echo ${maxKHz} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`,
    });
  }

  return output;
}

function generateOndemand({ status, tunable, governor }) {
  const output = [];
  const config = tunable?.[governor];
  if (!config) return output;

  const fields = [
    { key: "samplingRate", label: "Sampling Rate", path: "sampling_rate" },
    {
      key: "samplingDownFactor",
      label: "Sampling Down Factor",
      path: "sampling_down_factor",
    },
    { key: "thresholdUp", label: "Threshold UP", path: "up_threshold" },
    { key: "thresholdDown", label: "Threshold Down", path: "down_threshold" },
    { key: "powerBias", label: "Power Bias", path: "powersave_bias" },
  ];

  fields.forEach(({ key, label, path }) => {
    if (status[governor]?.[key]) {
      output.push({
        label,
        command: `echo ${config[key]} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/${path}`,
      });
    }
  });

  if (status[governor]?.isIgnoreNice) {
    output.push({
      label: "Ignore Nice Load",
      command: `echo ${config.isIgnoreNice ? 1 : 0} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/ignore_nice_load`,
    });
  }
  if (status[governor]?.isIoBusy) {
    output.push({
      label: "I/O Busy",
      command: `echo ${config.isIoBusy ? 1 : 0} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/io_is_busy`,
    });
  }

  return output;
}

function generateConservative({ status, tunable, governor }) {
  const output = [];
  const config = tunable?.[governor];
  if (!config) return output;

  // 💡 REVISI: Logika ganti governor di sini dihapus karena sudah di-handle global di atas

  const fields = [
    { key: "samplingRate", label: "Sampling Rate", path: "sampling_rate" },
    {
      key: "samplingDownFactor",
      label: "Sampling Down Factor",
      path: "sampling_down_factor",
    },
    { key: "thresholdUp", label: "Threshold UP", path: "up_threshold" },
    { key: "thresholdDown", label: "Threshold Down", path: "down_threshold" },
    { key: "frequencyStep", label: "Frequency Step", path: "freq_step" },
  ];

  fields.forEach(({ key, label, path }) => {
    if (status[governor]?.[key]) {
      output.push({
        label,
        command: `echo ${config[key]} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/${path}`,
      });
    }
  });

  if (status[governor]?.isIgnoreNice) {
    output.push({
      label: "Ignore Nice Load",
      command: `echo ${config.isIgnoreNice ? 1 : 0} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/ignore_nice_load`,
    });
  }

  return output;
}

function generateSchedutil({ status, tunable, governor }) {
  const output = [];
  const config = tunable?.[governor];

  if (status[governor]?.rateLimit && config?.rateLimit) {
    output.push({
      label: "Rate Limit",
      command: `echo ${config.rateLimit} | sudo tee /sys/devices/system/cpu/cpufreq/schedutil/rate_limit_us`,
    });
  }

  return output;
}

function generateUserspace({ status, tunable, governor }) {
  const output = [];
  const config = tunable?.[governor];

  console.log(config);

  if (status[governor]?.fixedFrequency && config?.fixedFrequency) {
    output.push({
      label: "Fixed Frequency",
      command: `echo ${config.fixedFrequency} | sudo tee /sys/devices/system/cpu/cpu0/cpufreq/scaling_setspeed`,
    });
  }

  if (status[governor]?.isDynamicScripting && config?.isDynamicScripting) {
    output.push({
      label: "Dynamic scripting diaktifkan",
      command: `-`,
    });
  }

  if (status[governor]?.isDynamicScripting && !config?.isDynamicScripting) {
    output.push({
      label: "Dynamic scripting dinonaktifkan",
      command: `-`,
    });
  }

  if (status[governor]?.script && config?.script) {
    output.push({
      label: "Script ditambahkan",
      command: `-`,
    });
  }

  return output;
}

function generateAffinity({ status, cores, numThread }) {
  const output = [];

  if (status?.core) {
    output.push({
      label: "Core Pinning",
      command: `taskset -c ${Array.isArray(cores) ? cores.join(",") : cores} python3 script.py`,
    });
  }

  if (status?.thread) {
    output.push({
      label: "Threading",
      command: `num_thread = ${numThread}`,
    });
  }

  return output;
}

const generators = {
  ondemand: generateOndemand,
  conservative: generateConservative,
  schedutil: generateSchedutil,
  userspace: generateUserspace,
};

// --- MAIN EXPORT FUNCTION ---

export function generateCommandFunction({ status, draft, governor, cores, numThread, freqDraft }) {
  const output = [];

  // 1. Jika governor sistem yang berubah
  if (status?.governor === true) {
    output.push(...generateGovernor({ status, governor }));
  }

  // 2. Jika frekuensi yang berubah
  if (typeof status?.freq === "object" && status.freq !== null) {
    output.push(...generateStatus({ status, freqDraft }));
  }

  // 3. Jika core atau thread yang berubah
  if (status?.core === true || status?.thread === true) {
    output.push(...generateAffinity({ status, cores, numThread }));
  }

  // 4. Jika ada perubahan parameter internal (tunables) milik governor
  // Gunakan governor eksplit dari parameter, jika tidak ada baru gunakan fallback
  const activeGov = governor || currentGovernorSystemFallback(draft);
  const generator = generators[activeGov];

  if (generator) {
    output.push(...generator({ status, tunable: draft, governor: activeGov }));
  }

  return output;
}

// Helper untuk mendeteksi sub-object mana yang sedang aktif dikirim di dalam draft/tunable
function currentGovernorSystemFallback(draft) {
  if (!draft) return null;
  const keys = ["ondemand", "conservative", "schedutil", "userspace"];
  return keys.find((key) => draft[key] !== undefined);
}
