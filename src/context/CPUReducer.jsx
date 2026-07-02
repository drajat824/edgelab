export const initialState = {
  governor: "performance",

  thread: 4,
  core: [0, 1, 2, 3],

  maxFreq: 2.1,
  minFreq: 1.4,

  ondemand: {
    thresholdUp: 85,
    thresholdDown: 50,
    samplingRate: 20000,
    samplingDownFactor: 1,
    isIgnoreNice: false,
    isIoBusy: false,
    powerBias: 0,
  },

  conservative: {
    thresholdUp: 80,
    thresholdDown: 20,
    samplingRate: 200000,
    samplingDownFactor: 1,
    isIgnoreNice: false,
    frequencyStep: 5,
  },

  schedutil: {
    rateLimit: 2000,
  },

  userspace: {
    fixedFrequency: 1.4,
    isDynamicScripting: false,
    script: "",
  },
};

export function cpuReducer(state, action) {
  switch (action.type) {
    case "CHANGE_GOVERNOR_CONFIG":
      return {
        ...state,
        [action.payload.governor]:
          action.payload.config[action.payload.governor],
      };

    case "CHANGE_GOVERNOR":
      return {
        ...state,
        governor: action.payload,
      };

    case "CHANGE_GOVERNOR_FREQUENCY":
      return {
        ...state,
        maxFreq: action.payload.maxFreq,
        minFreq: action.payload.minFreq,
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
