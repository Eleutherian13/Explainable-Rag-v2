import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 second timeout for processing
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log("API Response successful:", response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(
        "Response error:",
        error.response.status,
        error.response.data,
      );
    } else if (error.request) {
      // Request was made but no response
      console.error("No response received:", error.request);
      error.response = {
        data: {
          detail:
            "No response from server. Please check if the backend is running on " +
            API_BASE_URL,
        },
      };
    } else {
      console.error("Error:", error.message);
      error.response = {
        data: {
          detail: error.message,
        },
      };
    }
    return Promise.reject(error);
  },
);

export const uploadDocuments = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 second timeout for upload response
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkUploadStatus = async (sessionId) => {
  try {
    const response = await api.get(`/upload-status/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PHASE 1: Updated to use new detailed status format
export const waitForUploadCompletion = async (
  sessionId,
  maxWaitMs = 300000,
  pollIntervalMs = 1000,
) => {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const status = await checkUploadStatus(sessionId);
      console.log(
        `[POLL] Upload status: ${status.overall_status}, stage: ${status.current_stage}`,
      );

      if (status.overall_status === "completed") {
        console.log(`[POLL] Upload completed successfully`);
        return status;
      }

      if (status.overall_status === "error") {
        throw new Error(`Upload error: ${status.error_message}`);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    } catch (error) {
      // If session not found yet, try again
      if (error.response?.status === 404) {
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Upload did not complete within ${maxWaitMs}ms`);
};

// PHASE 1: Export endpoints
export const exportChunks = async (sessionId) => {
  try {
    const response = await api.post(`/export/chunks/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportEntities = async (sessionId, format = "json") => {
  try {
    const response = await api.post(
      `/export/entities/${sessionId}?format=${format}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportGraph = async (sessionId) => {
  try {
    const response = await api.post(`/export/graph/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportReasoningTrace = async (sessionId) => {
  try {
    const response = await api.post(`/export/trace/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitQuery = async (query, indexId, topK = 5) => {
  try {
    // PHASE 2: Support advanced query settings
    const response = await api.post("/query-enhanced", {
      query,
      index_id: indexId,
      top_k: topK,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PHASE 2: Exclude entity and regenerate (what-if mode)
export const queryWithExcludedEntity = async (
  query,
  indexId,
  excludedEntity,
  topK = 5,
) => {
  try {
    const response = await api.post("/query-exclude-entity", {
      query,
      index_id: indexId,
      excluded_entity: excludedEntity,
      top_k: topK,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PHASE 2: Regenerate with specific entity focus
export const queryWithEntityFocus = async (
  query,
  indexId,
  focusEntity,
  topK = 5,
) => {
  try {
    const response = await api.post("/query-entity-focus", {
      query,
      index_id: indexId,
      focus_entity: focusEntity,
      top_k: topK,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStatus = async () => {
  try {
    const response = await api.get("/status");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const clearSession = async (indexId) => {
  try {
    const response = await api.post("/clear", null, {
      params: { index_id: indexId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadDocuments = async (indexId) => {
  try {
    const response = await api.get(`/download/documents/${indexId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPipelineStatus = async (indexId) => {
  try {
    const response = await api.get(`/pipeline/status/${indexId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
