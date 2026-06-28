export const initialState = {
    governor: "performance",

    performance: {
        maxFreq: 1800000,
    },

    powersave: {
        minFreq: 600000,
    },

    ondemand: {
        maxFreq: 1800000,
        minFreq: 600000,
        thresholdUp: null,
        thresholdDown: null,
        samplingRate: null,
        samplingDownFactor: null,
        isIgnoreNice: false,
        isIoBusy: false,
        powerBias: null,
    },

    conservative: {
        maxFreq: 1800000,
        minFreq: 600000,
        thresholdUp: null,
        thresholdDown: null,
        samplingRate: null,
        samplingDownFactor: null,
        isIgnoreNice: false,
        frequencyStep: null,
    },

    schedutil: {
        maxFreq: 1800000,
        minFreq: 600000,
        rateLimit: null,
    },

    userspace: {
        maxFreq: 1800000,
        minFreq: 600000,
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

        case "RESET":
            return initialState;

        default:
            return state;
    }
}