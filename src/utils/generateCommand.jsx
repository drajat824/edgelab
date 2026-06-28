function generatePerformance({ status, draft }) {
    const output = [];
    const gov = draft?.governor;

    if (status?.governor) {
        output.push({
            label: "Change Governor",
            command: `echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`
        });
    }
    if (status[gov]?.maxFreq) {
        output.push({
            label: "Max Frequency",
            command: `echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`
        });
    }

    return output;
}
function generatePowersave({ status, draft }) {
    const output = [];
    const gov = draft?.governor;

    if (status?.governor) {
        output.push({
            label: "Change Governor",
            command: `echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`
        });
    }
    if (status[gov]?.maxFreq) {
        output.push({
            label: "Max Frequency",
            command: `echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`
        });
    }
    if (status[gov]?.minFreq) {
        output.push({
            label: "Min Frequency",
            command: `echo ${draft[gov]?.minFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`
        });
    }

    return output;
}

function generateOndemand({ status, draft }) {
    const output = [];
    const gov = draft?.governor;

    if (status?.governor) {
        output.push({
            label: "Change Governor",
            command: `echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`
        });
    }
    if (status[gov]?.maxFreq) {
        output.push({
            label: "Max Frequency",
            command: `echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`
        });
    }
    if (status[gov]?.minFreq) {
        output.push({
            label: "Min Frequency",
            command: `echo ${draft[gov]?.minFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`
        });
    }
    if (status[gov]?.thresholdUp) {
        output.push({
            label: "Threshold UP",
            command: `echo ${draft[gov]?.thresholdUp} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/up_threshold`
        });
    }
    if (status[gov]?.thresholdDown) {
        output.push({
            label: "Threshold Down",
            command: `echo ${draft[gov]?.thresholdDown} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/down_threshold`
        });
    }
    if (status[gov]?.samplingRate) {
        output.push({
            label: "Sampling Rate",
            command: `echo ${draft[gov]?.samplingRate} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/sampling_rate`
        });
    }
    if (status[gov]?.samplingDownFactor) {
        output.push({
            label: "Sampling Down Factor",
            command: `echo ${draft[gov]?.samplingDownFactor} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/sampling_down_factor`
        });
    }
    if (status[gov]?.isIgnoreNice) {
        output.push({
            label: "Ignore Nice Load",
            command: `echo ${draft[gov]?.isIgnoreNice ? 1 : 0} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/ignore_nice_load`
        });
    }
    if (status[gov]?.isIoBusy) {
        output.push({
            label: "I/O Busy",
            command: `echo ${draft[gov]?.isIoBusy ? 1 : 0} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/io_is_busy`
        });
    }
    if (status[gov]?.powerBias) {
        output.push({
            label: "Power Bias",
            command: `echo ${draft[gov]?.powerBias} | sudo tee /sys/devices/system/cpu/cpufreq/ondemand/powersave_bias`
        });
    }

    return output;
}

function generateConservative({ status, draft }) {
    const output = [];
    const gov = draft?.governor;

    if (status?.governor) {
        output.push({
            label: "Change Governor",
            command: `echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`
        });
    }
    if (status[gov]?.maxFreq) {
        output.push({
            label: "Max Frequency",
            command: `echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`
        });
    }
    if (status[gov]?.minFreq) {
        output.push({
            label: "Min Frequency",
            command: `echo ${draft[gov]?.minFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`
        });
    }
    if (status[gov]?.thresholdUp) {
        output.push({
            label: "Threshold UP",
            command: `echo ${draft[gov]?.thresholdUp} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/up_threshold`
        });
    }
    if (status[gov]?.thresholdDown) {
        output.push({
            label: "Threshold Down",
            command: `echo ${draft[gov]?.thresholdDown} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/down_threshold`
        });
    }
    if (status[gov]?.samplingRate) {
        output.push({
            label: "Sampling Rate",
            command: `echo ${draft[gov]?.samplingRate} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/sampling_rate`
        });
    }
    if (status[gov]?.samplingDownFactor) {
        output.push({
            label: "Sampling Down Factor",
            command: `echo ${draft[gov]?.samplingDownFactor} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/sampling_down_factor`
        });
    }
    if (status[gov]?.isIgnoreNice) {
        output.push({
            label: "Ignore Nice Load",
            command: `echo ${draft[gov]?.isIgnoreNice ? 1 : 0} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/ignore_nice_load`
        });
    }
    if (status[gov]?.frequencyStep) {
        output.push({
            label: "Frequency Step",
            command: `echo ${draft[gov]?.frequencyStep} | sudo tee /sys/devices/system/cpu/cpufreq/conservative/freq_step`
        });
    }

    return output;
}

function generateSchedutil({ status, draft }) {
    const output = [];
    const gov = draft?.governor;

    if (status?.governor) {
        output.push({
            label: "Change Governor",
            command: `echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`
        });
    }
    if (status[gov]?.maxFreq) {
        output.push({
            label: "Max Frequency",
            command: `echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`
        });
    }
    if (status[gov]?.minFreq) {
        output.push({
            label: "Min Frequency",
            command: `echo ${draft[gov]?.minFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`
        });
    }
    if (status[gov]?.rateLimit) {
        output.push({
            label: "Rate Limit",
            command: `echo ${draft[gov]?.rateLimit} | sudo tee /sys/devices/system/cpu/cpufreq/schedutil/rate_limit_us`
        });
    }

    return output;
}

function generateUserspace({ status, draft }) {
    const output = [];
    const gov = draft?.governor;

    if (status?.governor) {
        output.push({
            label: "Change Governor",
            command: `echo ${gov} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`
        });
    }
    if (status[gov]?.maxFreq) {
        output.push({
            label: "Max Frequency",
            command: `echo ${draft[gov]?.maxFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq`
        });
    }
    if (status[gov]?.minFreq) {
        output.push({
            label: "Min Frequency",
            command: `echo ${draft[gov]?.minFreq} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq`
        });
    }
    if (status[gov]?.fixedFrequency) {
        output.push({
            label: "Fixed Frequency",
            command: `echo ${draft[gov]?.fixedFrequency} | sudo tee /sys/devices/system/cpu/cpu0/cpufreq/scaling_setspeed`
        });
    }

    return output;
}

function generateAffinity({ status, coreDraft, threadDraft }) {
    const output = [];

    if (status?.core) {
        output.push({
            label: "Core Pinning",
            command: `taskset -c ${Array.isArray(coreDraft) ? coreDraft.join(',') : coreDraft} python3 script.py`
        });
    }

    if (status?.thread) {
        output.push({
            label: "Threading",
            command: `num_thread = ${threadDraft}`
        });
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

export function generateCommandFunction({ status, draft, coreDraft, threadDraft }) {
    if (status?.core || status?.thread) {
        return generateAffinity({ status, coreDraft, threadDraft })
    } else {
        const generator = generators[draft?.governor];
        if (!generator) return [];
        return generator({ status, draft });
    }
}