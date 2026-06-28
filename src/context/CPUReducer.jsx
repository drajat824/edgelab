export const initialState = {
    governor: "performance",

    thread: 4,
    core: [0, 1, 2, 3],

    performance: {
        maxFreq: 1.8,
    },

    powersave: {
        minFreq: 0.6,
    },

    ondemand: {
        maxFreq: 1.8,
        minFreq: 0.6,
        thresholdUp: 85,
        thresholdDown: 50,
        samplingRate: 20000,
        samplingDownFactor: 1,
        isIgnoreNice: false,
        isIoBusy: false,
        powerBias: 0,
    },

    conservative: {
        maxFreq: 1.8,
        minFreq: 0.6,
        thresholdUp: 80,
        thresholdDown: 20,
        samplingRate: 200000,
        samplingDownFactor: 1,
        isIgnoreNice: false,
        frequencyStep: 5,
    },

    schedutil: {
        maxFreq: 1.8,
        minFreq: 0.6,
        rateLimit: 2000,
    },

    userspace: {
        maxFreq: 1.8,
        minFreq: 0.6,
        fixedFrequency: 1.8,
        isDynamicScripting: false,
        script: "",
    }
}

export function cpuReducer(state, action) {
    switch (action.type) {
        case "CHANGE_GOVERNOR_CONFIG":
            return {
                ...state,
                [action.payload.governor]:
                    action.payload.config[action.payload.governor]
            };

        case "CHANGE_GOVERNOR":
            return {
                ...state,
                governor: action.payload,
            };

        case "CHANGE_THREAD_CONFIG":
            return {
                ...state,
                thread: action.payload,
            };

        case "CHANGE_CORE_CONFIG":
            return {
                ...state,
                core: action.payload,
            };

        case "RESET":
            return initialState;

        default:
            return state;
    }
}