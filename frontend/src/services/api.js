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
  }
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
      console.error("Response error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error("No response received:", error.request);
      error.response = {
        data: {
          detail: "No response from server. Please check if the backend is running on " + API_BASE_URL
        }
      };
    } else {
      console.error("Error:", error.message);
      error.response = {
        data: {
          detail: error.message
        }
      };
    }
    return Promise.reject(error);
  }
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
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitQuery = async (query, indexId) => {
  try {
    const response = await api.post("/query", {
      query,
      index_id: indexId,
      top_k: 5,
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

export default api;
