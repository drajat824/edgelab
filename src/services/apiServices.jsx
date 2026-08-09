import { api, apiAi } from "./api";

const apiServices = {
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
    try {
      return await api.post("/api/cpu/governor/params", paramsData);
    } catch (error) {
      throw error;
    }
  },

  // Start Dynamic Scripting Engine
  startDynamicScripting: async () => {
    try {
      const response = await api.get("/api/cpu/userspace/start");
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || error.message;
    }
  },

  // Stop Dynamic Scripting Engine
  stopDynamicScripting: async () => {
    try {
      const response = await api.get("/api/cpu/userspace/stop");
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || error.message;
    }
  },

  // Validasi Dynamic Scripting
  validateScript: async (paramsData) => {
    try {
      const response = await api.post("/api/cpu/userspace/validate", paramsData);
      return response;
    } catch (error) {
      throw error.response?.data?.detail || error.message;
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

  // === UNTUK EDGELAB - AI ===

  //  THREAD
  getThread: async () => {
    try {
      return await apiAi.get("/api/thread");
    } catch (error) {
      throw error;
    }
  },

  updateThread: async ({ thread }) => {
    try {
      return await apiAi.post("/api/thread", {
        thread: thread,
      });
    } catch (error) {
      throw error;
    }
  },

  // CORES
  getCore: async () => {
    try {
      return await apiAi.get("/api/core");
    } catch (error) {
      throw error;
    }
  },

  updateCore: async ({ core }) => {
    try {
      return await apiAi.post("/api/core", {
        core: core,
      });
    } catch (error) {
      throw error;
    }
  },

  // FPS
  getFps: async () => {
    try {
      return await apiAi.get("/api/fps");
    } catch (error) {
      throw error;
    }
  },

  updateFps: async ({ cameraFps }) => {
    try {
      return await apiAi.post("/api/fps", {
        fps_camera: cameraFps,
      });
    } catch (error) {
      throw error;
    }
  },

  // VIDEO

  startCalibrate: async () => {
    try {
      return await apiAi.get("/start-calibrate");
    } catch (error) {
      throw error;
    }
  },

  startDetection: async ({ calibration_points }) => {
    console.log(calibration_points);
    try {
      return await apiAi.post("/start-detection", {
        calibration_points: calibration_points,
      });
    } catch (error) {
      throw error;
    }
  },

  stopVideo: async () => {
    try {
      return await apiAi.get("/stop");
    } catch (error) {
      throw error;
    }
  },

  // GT
  getGT: async () => {
    try {
      return await apiAi.get("/api/gt");
    } catch (error) {
      throw error;
    }
  },

  addGT: async (board_id, board_name, ground_truth) => {
    try {
      return await apiAi.post("/api/gt", {
        board_id: board_id,
        board_name: board_name,
        ground_truth: ground_truth,
      });
    } catch (error) {
      throw error;
    }
  },

  updateGT: async (board_id, board_name, ground_truth) => {
    try {
      return await apiAi.put(`/api/gt/${board_id}`, {
        board_name: board_name,
        ground_truth: ground_truth,
      });
    } catch (error) {
      throw error;
    }
  },

  deleteGT: async ({ board_id }) => {
    try {
      return await apiAi.delete(`/api/gt/${board_id}`);
    } catch (error) {
      throw error;
    }
  },

  activeGT: async (boardId) => {
    try {
      return await apiAi.post("/api/gt/active-board", {
        active_board: boardId,
      });
    } catch (error) {
      throw error;
    }
  },

  getActiveGT: async () => {
    try {
      return await apiAi.get("/api/gt/active-board");
    } catch (error) {
      throw error;
    }
  },

  // SESSION

  checkStatus: async (token) => {
    try {
      const res = await api.post("/api/session/check", { token });
      return res;
    } catch (error) {
      throw error;
    }
  },

  sendHeartbeat: async (token) => {
    try {
      const res = await api.post("/api/session/heartbeat", { token });
      return res;
    } catch (error) {
      throw error;
    }
  },

  // MODEL

  // Get Model
  getModel: async () => {
    try {
      return await apiAi.get("/api/models");
    } catch (error) {
      throw error;
    }
  },

  // Select Model
  selectModel: async (model_name) => {
    try {
      return await apiAi.post(`/api/models`, {
        model_name: model_name,
      });
    } catch (error) {
      throw error;
    }
  },

  // Upload Model
  uploadModel: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiAi.post("/api/upload-models", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default apiServices;
