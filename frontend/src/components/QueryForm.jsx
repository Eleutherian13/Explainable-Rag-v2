import React, { useState } from "react";
import { Send } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { submitQuery } from "../services/api";
import AdvancedQueryControls from "./AdvancedQueryControls";
import QueryHistory from "./QueryHistory";

export default function QueryForm() {
  const [localQuery, setLocalQuery] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonQueries, setComparisonQueries] = useState([null, null]);
  
  const indexId = useAppStore((state) => state.indexId);
  const setResults = useAppStore((state) => state.setResults);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const addToQueryHistory = useAppStore((state) => state.addToQueryHistory);
  const advancedSettings = useAppStore((state) => state.advancedSettings);
  const loading = useAppStore((state) => state.loading);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!indexId) {
      setError("Please upload documents first");
      return;
    }

    if (!localQuery.trim()) {
      setError("Please enter a query");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // PHASE 2: Use advanced settings (topK from settings)
      const result = await submitQuery(localQuery, indexId, advancedSettings.topK);
      setResults(result);
      
      // PHASE 2: Add to query history
      addToQueryHistory(localQuery, result);
      
      setLocalQuery("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process query");
    } finally {
      setLoading(false);
    }
  };

  // PHASE 2: Handle query selection from history
  const handleSelectFromHistory = (query) => {
    setLocalQuery(query);
  };

  // PHASE 2: Handle side-by-side comparison
  const handleCompareQueries = (query1, query2) => {
    setComparisonQueries([query1, query2]);
    setShowComparison(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Main Query Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Send className="w-6 h-6" />
          Ask a Question
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Query
            </label>
            <textarea
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              disabled={!indexId || loading}
              placeholder="Enter your question here..."
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="text-sm text-gray-600 mb-4">
            {indexId ? (
              <p className="text-green-600 flex items-center gap-1">
                ✓ Documents indexed and ready
              </p>
            ) : (
              <p className="text-yellow-600">
                ⚠ Upload documents first to enable queries
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!indexId || loading || !localQuery.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Query
              </>
            )}
          </button>
        </form>
      </div>

      {/* PHASE 2: Advanced Query Controls */}
      {indexId && <AdvancedQueryControls />}

      {/* PHASE 2: Query History */}
      {indexId && (
        <QueryHistory
          onSelectQuery={handleSelectFromHistory}
          onCompareQueries={handleCompareQueries}
        />
      )}

      {/* PHASE 2: Side-by-side Comparison */}
      {showComparison && comparisonQueries[0] && comparisonQueries[1] && (
        <div className="bg-white rounded-lg shadow p-6 border-2 border-purple-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Query Comparison</h3>
            <button
              onClick={() => {
                setShowComparison(false);
                setComparisonQueries([null, null]);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs font-semibold text-purple-900 mb-1">Query 1</p>
              <p className="text-sm text-gray-800">{comparisonQueries[0].query}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs font-semibold text-purple-900 mb-1">Query 2</p>
              <p className="text-sm text-gray-800">{comparisonQueries[1].query}</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-4">
            💡 Run both queries to see side-by-side results comparison in the results panel
          </p>
        </div>
      )}
    </div>
  );
}