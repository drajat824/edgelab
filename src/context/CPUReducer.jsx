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
        thresholdUp: null,
        thresholdDown: null,
        samplingRate: null,
        samplingDownFactor: null,
        isIgnoreNice: false,
        isIoBusy: false,
        powerBias: null,
    },

    conservative: {
        maxFreq: 1.8,
        minFreq: 0.6,
        thresholdUp: null,
        thresholdDown: null,
        samplingRate: null,
        samplingDownFactor: null,
        isIgnoreNice: false,
        frequencyStep: null,
    },

    schedutil: {
        maxFreq: 1.8,
        minFreq: 0.6,
        rateLimit: null,
    },

    userspace: {
        maxFreq: 1.8,
        minFreq: 0.6,
        fixedFrequency: null,
        isDynamicScripting: false,
        script: "",
    },
};

export function cpuReducer(state, action) {
    switch (action.type) {
        case "SAVE_GOVERNOR_CONFIG":
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

        case "CHANGE_THREAD":
            return {
                ...state,
                thread: action.payload,
            };

        case "CHANGE_CORE":
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