/**
 * PHASE 2: Advanced Query Controls Component
 * Provides expandable controls for:
 * - Top-K retrieval depth
 * - Entity granularity (coarse, medium, fine)
 * - Explanation verbosity
 */

import React, { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { useAppStore } from "../store/appStore";

export default function AdvancedQueryControls() {
  const [isExpanded, setIsExpanded] = useState(false);
  const advancedSettings = useAppStore((state) => state.advancedSettings);
  const setAdvancedSettings = useAppStore((state) => state.setAdvancedSettings);

  const handleTopKChange = (topK) => {
    setAdvancedSettings({ topK });
  };

  const handleGranularityChange = (granularity) => {
    setAdvancedSettings({ entityGranularity: granularity });
  };

  const handleVerbosityChange = (verbosity) => {
    setAdvancedSettings({ verbosity });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">Advanced Query Settings</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4 bg-gray-50">
          {/* Top-K Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retrieval Depth (Top-K)
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Number of most relevant documents to retrieve
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="20"
                value={advancedSettings.topK}
                onChange={(e) => handleTopKChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold min-w-fit">
                {advancedSettings.topK} docs
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              More documents = broader context but slower, fewer = faster but more narrow
            </p>
          </div>

          {/* Entity Granularity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Extraction Granularity
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Level of detail when extracting entities
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "coarse", label: "Coarse", desc: "Major concepts only" },
                { value: "medium", label: "Medium", desc: "Standard extraction" },
                { value: "fine", label: "Fine", desc: "Detailed entities" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleGranularityChange(option.value)}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    advancedSettings.entityGranularity === option.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Explanation Verbosity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation Verbosity
            </label>
            <p className="text-xs text-gray-600 mb-2">
              How detailed the generated explanations should be
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "minimal", label: "Minimal", desc: "Quick summary" },
                { value: "balanced", label: "Balanced", desc: "Standard detail" },
                { value: "detailed", label: "Detailed", desc: "Full explanation" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleVerbosityChange(option.value)}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    advancedSettings.verbosity === option.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Settings Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mt-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Current Settings:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• Retrieve: Top {advancedSettings.topK} documents</p>
              <p>• Entity extraction: {advancedSettings.entityGranularity} granularity</p>
              <p>• Explanation: {advancedSettings.verbosity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
