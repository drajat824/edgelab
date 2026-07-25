export const initialState = {
  governor: "",

  numThread: null,
  cores: [],

  maxFreq: null,
  minFreq: null,

  fpsCamera: null,

  ondemand: {
    thresholdUp: null,
    samplingRate: null,
    samplingDownFactor: null,
    isIgnoreNice: false,
    isIoBusy: false,
    powerBias: 0,
  },

  conservative: {
    thresholdUp: null,
    thresholdDown: null,
    samplingRate: null,
    samplingDownFactor: null,
    isIgnoreNice: false,
    frequencyStep: null,
  },

  schedutil: {
    rateLimit: null,
  },

  userspace: {
    fixedFrequency: null,
    isDynamicScripting: false,
    script: "",
  },

};

export function cpuReducer(state, action) {
  switch (action.type) {
    case "CHANGE_GOVERNOR_CONFIG":
      return {
        ...state,
        [action.payload.governor]: action.payload.config[action.payload.governor],
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

    case "CHANGE_FPS_CONFIG":
      return {
        ...state,
        fpsCamera: action.payload,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}
