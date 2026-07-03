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
  updateGovernor: async (governorName) => {
    try {
      return await api.post("/api/cpu/governor", { governor: governorName });
    } catch (error) {
      throw error;
    }
  },

   // POST - GANTI FREKUENSI
  updateGovernor: async ({minFreq, maxFreq}) => {
    try {
      return await api.post("/api/cpu/frequency", { minFreq: minFreq, maxFreq: maxFreq });
    } catch (error) {
      throw error;
    }
  },

  // POST - GANTI PARAMETER GOVERNOR
  updateGovernorParams: async (activeGovernor, paramsData) => {
    try {
      const payload = {
        [activeGovernor]: paramsData,
      };
      return await api.post("/api/cpu/governor/params", payload);
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
