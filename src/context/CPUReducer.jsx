export const initialState = {
    governor: "",
    minFreq: 600000,
    maxFreq: 1800000,

    ondemand: {
        thresholdUp: null,
        thresholdDown: null,
        samplingRate: null,
        samplingDownFactor: null,
        isIgnoreNice: true,
        isIoBusy: true,
        powerBias: null,
    },

    conservative: {
        thresholdUp: null,
        thresholdDown: null,
        samplingRate: null,
        samplingDownFactor: null,
        isIgnoreNice: 0,
        frequencyStep: null,
    },

    schedutil: {
        rateLimit: null,
    },

    userspace: {
        fixedFrequency: null,
        isDynamicScripting: 0,
        script: "",
    },
};

export function cpuReducer(state, action) {
    switch (action.type) {

        case "CHANGE_GOVERNOR":

            return {
                ...state,

                governor: action.payload.governor,

                minFreq: action.payload.minFreq,

                maxFreq: action.payload.maxFreq,

                [action.payload.governor]: {
                    ...action.payload.config
                }
            }

        case "RESET":

            return initialState;

        default:

            return state;
    }
}