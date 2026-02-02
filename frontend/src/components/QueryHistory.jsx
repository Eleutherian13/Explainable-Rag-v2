/**
 * PHASE 2: Query History Component
 * Provides:
 * - Persistent query history (last 20 queries)
 * - Ability to reload and re-run queries
 * - Side-by-side comparison of two queries
 */

import React, { useState } from "react";
import { Clock, Trash2, Copy, ChevronDown, GitCompare } from "lucide-react";
import { useAppStore } from "../store/appStore";

export default function QueryHistory({ onSelectQuery, onCompareQueries }) {
  const queryHistory = useAppStore((state) => state.queryHistory);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSelectForComparison = (index) => {
    if (selectedForComparison.includes(index)) {
      setSelectedForComparison(
        selectedForComparison.filter((i) => i !== index),
      );
    } else if (selectedForComparison.length < 2) {
      setSelectedForComparison([...selectedForComparison, index]);
    }
  };

  const handleCompare = () => {
    if (selectedForComparison.length === 2) {
      onCompareQueries(
        queryHistory[selectedForComparison[0]],
        queryHistory[selectedForComparison[1]],
      );
      setSelectedForComparison([]);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear the query history?")) {
      // This would require a new store action
      console.log("Clear history requested");
    }
  };

  if (queryHistory.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">Query History</span>
          <span className="ml-auto text-xs text-gray-500">
            ({queryHistory.length} queries)
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-4 py-4 bg-gray-50 max-h-96 overflow-y-auto">
          {/* Comparison Mode */}
          {selectedForComparison.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900">
                  Comparison Mode: {selectedForComparison.length}/2 selected
                </span>
                {selectedForComparison.length === 2 && (
                  <button
                    onClick={handleCompare}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <GitCompare className="w-3 h-3" />
                    Compare
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedForComparison([])}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Clear selection
              </button>
            </div>
          )}

          {/* Query List */}
          <div className="space-y-2">
            {queryHistory.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-colors ${
                  selectedForComparison.includes(index)
                    ? "border-blue-400 bg-blue-100"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  {/* Comparison Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedForComparison.includes(index)}
                    onChange={() => handleSelectForComparison(index)}
                    className="mt-1 w-4 h-4 cursor-pointer"
                  />

                  {/* Query Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 break-words">
                      {item.query}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(item.timestamp)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        // Copy query to clipboard
                        navigator.clipboard.writeText(item.query);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Copy query"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onSelectQuery(item.query)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Re-run query"
                    >
                      <span className="text-xs font-semibold text-blue-600">
                        Re-run
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clear History */}
          <button
            onClick={handleClearHistory}
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}
