import { create } from "zustand";

export const useAppStore = create((set) => ({
  // Basic state
  indexId: null,
  documents: [],
  query: "",
  results: null,
  loading: false,
  error: null,

  // PHASE 1: Document processing status
  uploadingFiles: [],
  processingStatus: {
    overall_status: "idle",
    current_stage: "",
    documents: [],
  },

  // PHASE 2: Query history and advanced settings
  queryHistory: [],
  advancedSettings: {
    topK: 5,
    entityGranularity: "fine",
    verbosity: "balanced",
  },

  // PHASE 6: Answer inspection
  selectedSentenceIndex: null,
  answerSentences: [],

  // Setters
  setIndexId: (indexId) => set({ indexId }),
  setDocuments: (documents) => set({ documents }),
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // PHASE 1: Update upload and processing status
  setUploadingFiles: (files) => set({ uploadingFiles: files }),
  setProcessingStatus: (status) =>
    set({ processingStatus: status }),

  // PHASE 2: Query history management
  addToQueryHistory: (query, results) =>
    set((state) => ({
      queryHistory: [
        { query, results, timestamp: new Date().toISOString() },
        ...state.queryHistory.slice(0, 19),
      ],
    })),

  setAdvancedSettings: (settings) =>
    set((state) => ({
      advancedSettings: {
        ...state.advancedSettings,
        ...settings,
      },
    })),

  // PHASE 6: Answer inspection setters
  setSelectedSentenceIndex: (index) =>
    set({ selectedSentenceIndex: index }),
  setAnswerSentences: (sentences) =>
    set({ answerSentences: sentences }),

  // Reset all state
  reset: () =>
    set({
      indexId: null,
      documents: [],
      query: "",
      results: null,
      loading: false,
      error: null,
      uploadingFiles: [],
      processingStatus: {
        overall_status: "idle",
        current_stage: "",
        documents: [],
      },
      queryHistory: [],
      selectedSentenceIndex: null,
      answerSentences: [],
    }),
}));
