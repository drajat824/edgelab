import api from "./api";

export const cpuService = {
  // GET GOVERNOR
  getGovernorStatus: async () => {
    try {
      return await api.get("/api/cpu/status");
    } catch (error) {
      throw error;
    }
  },

  // POST - GANTI GOVERNOR
  updateGovernor: async ({ governor }) => {
    try {
      return await api.post("/api/cpu/governor", { governor: governor });
    } catch (error) {
      throw error;
    }
  },

  // POST - GANTI FREKUENSI
  updateFrequency: async ({ minFreq, maxFreq }) => {
    try {
      return await api.post("/api/cpu/frequency", {
        minFreq: minFreq,
        maxFreq: maxFreq,
      });
    } catch (error) {
      throw error;
    }
  },

  // POST - GANTI PARAMETER GOVERNOR
  updateGovernorParams: async (paramsData) => {
    console.log(paramsData, "PARAMSDATA")
    try {
      return await api.post("/api/cpu/governor/params", paramsData);
    } catch (error) {
      throw error;
    }
  },

  // GET LOG
  getDebugLog: async () => {
    try {
      return await api.get("/log");
    } catch (error) {
      throw error;
    }
  },
};
