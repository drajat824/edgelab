function generatePerformance({ status, draft }) {
    const output = [];
    const gov = draft?.governor;

    if (status?.governor) {
        output.push(`Change Governor: echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`);
    }
    if (status[gov]?.maxFreq) {
        output.push(`Max Frequency: echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`);
    }
    if (status[gov]?.minFreq) {
        output.push(`Min Frquency: echo ${draft[gov]?.minFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`);
    }

    return output;
}

function generatePowersave({ status, draft }) {
    const output = [];
    const gov = draft?.governor;

    if (status?.governor) {
        output.push(`Change Governor: echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`);
    }
    if (status[gov]?.maxFreq) {
        output.push(`Max Frequency: echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`);
    }
    if (status[gov]?.minFreq) {
        output.push(`Min Frequency: echo ${draft[gov]?.minFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`);
    }

    return output;
}

function generateOndemand({ status, draft }) {
    const output = [];
    const gov = draft?.governor; // pasti "ondemand"

    if (status?.governor) {
        output.push(`Change Governor: echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`);
    }
    if (status[gov]?.maxFreq) {
        output.push(`Max Frequency: echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`);
    }
    if (status[gov]?.minFreq) {
        output.push(`Min Frequency: echo ${draft[gov]?.minFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`);
    }
    if (status[gov]?.thresholdUp) {
        output.push(`Threshold UP: echo ${draft[gov]?.thresholdUp} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/up_threshold`);
    }
    if (status[gov]?.thresholdDown) {
        output.push(`Threshold Down: echo ${draft[gov]?.thresholdDown} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/down_threshold`);
    }
    if (status[gov]?.samplingRate) {
        output.push(`Sampling Rate: echo ${draft[gov]?.samplingRate} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/sampling_rate`);
    }
    if (status[gov]?.samplingDownFactor) {
        output.push(`Sampling Down Factor: echo ${draft[gov]?.samplingDownFactor} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/sampling_down_factor`);
    }
    if (status[gov]?.isIgnoreNice) {
        output.push(`Ignore Nice Load: echo ${draft[gov]?.isIgnoreNice} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/ignore_nice_load`);
    }
    if (status[gov]?.isIoBusy) {
        output.push(`I/O Busy: echo ${draft[gov]?.isIoBusy} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/io_is_busy`);
    }
    if (status[gov]?.powerBias) {
        output.push(`Power Bias: echo ${draft[gov]?.powerBias} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/powersave_bias`);
    }

    return output;
}

function generateConservative({ status, draft }) {
    const output = [];
    const gov = draft?.governor; // pasti "conservative"

    if (status?.governor) {
        output.push(`Change Governor: echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`);
    }
    if (status[gov]?.maxFreq) {
        output.push(`Max Frequency: echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`);
    }
    if (status[gov]?.minFreq) {
        output.push(`Min Frequency: echo ${draft[gov]?.minFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`);
    }
    if (status[gov]?.thresholdUp) {
        output.push(`Threshold UP: echo ${draft[gov]?.thresholdUp} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/up_threshold`);
    }
    if (status[gov]?.thresholdDown) {
        output.push(`Threshold Down: echo ${draft[gov]?.thresholdDown} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/down_threshold`);
    }
    if (status[gov]?.samplingRate) {
        output.push(`Sampling Rate: echo ${draft[gov]?.samplingRate} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/sampling_rate`);
    }
    if (status[gov]?.samplingDownFactor) {
        output.push(`Sampling Down Factor: echo ${draft[gov]?.samplingDownFactor} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/sampling_down_factor`);
    }
    if (status[gov]?.isIgnoreNice) {
        output.push(`Ignore Nice Load: echo ${draft[gov]?.isIgnoreNice} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/ignore_nice_load`);
    }
    if (status[gov]?.frequencyStep) {
        output.push(`Frequency Step: echo ${draft[gov]?.frequencyStep} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/freq_step`);
    }

    return output;
}

function generateSchedutil({ status, draft }) {
    const output = [];
    const gov = draft?.governor; // pasti "schedutil"

    if (status?.governor) {
        output.push(`Change Governor: echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`);
    }
    if (status[gov]?.maxFreq) {
        output.push(`Max Frequency: echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`);
    }
    if (status[gov]?.minFreq) {
        output.push(`Min Frequency: echo ${draft[gov]?.minFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`);
    }
    if (status[gov]?.rateLimit) {
        output.push(`Rate Limit: echo ${draft[gov]?.rateLimit} | sudo tee /sys/devices/system/cpu/cpufreq/schedutil/rate_limit_us`);
    }

    return output;
}

function generateUserspace({ status, draft }) {
    const output = [];
    const gov = draft?.governor; // pasti "userspace"

    if (status?.governor) {
        output.push(`Change Governor: echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`);
    }
    if (status[gov]?.maxFreq) {
        output.push(`Max Frequency: echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`);
    }
    if (status[gov]?.minFreq) {
        output.push(`Min Frequency: echo ${draft[gov]?.minFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`);
    }
    if (status[gov]?.fixedFrequency) {
        output.push(`Fixed Frequency: echo ${draft[gov]?.fixedFrequency} | sudo tee /sys/devices/system/cpu/cpu0/cpufreq/scaling_setspeed`);
    }

    return output;
}

const generators = {
    performance: generatePerformance,
    powersave: generatePowersave,
    ondemand: generateOndemand,
    conservative: generateConservative,
    schedutil: generateSchedutil,
    userspace: generateUserspace,
};

export function generateCommandFunction({ status, draft }) {
    const generator = generators[draft?.governor];
    if (!generator) return [];
    return generator({ status, draft });
}