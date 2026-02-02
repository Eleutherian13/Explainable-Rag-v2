import React, { useState, useEffect } from "react";
import { ChevronDown, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { getPipelineStatus } from "../services/api";

export default function PipelineVisualization() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const indexId = useAppStore((state) => state.indexId);

  useEffect(() => {
    if (indexId) {
      loadPipelineData();
    }
  }, [indexId]);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      const data = await getPipelineStatus(indexId);
      setStages(data.pipeline_stages || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load pipeline status");
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  if (!indexId) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Processing Pipeline
        </h2>
        <button
          onClick={loadPipelineData}
          disabled={loading}
          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {stages.length > 0 ? (
        <div className="space-y-3">
          {stages.map((stage, idx) => (
            <div key={idx} className="relative">
              {/* Connector line */}
              {idx < stages.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-300"></div>
              )}

              <div className="flex items-start gap-4">
                {/* Status icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-400 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>

                {/* Stage details */}
                <div className="flex-grow mt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {stage.stage}
                    </h3>
                    <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {stage.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-gray-50 rounded p-2 border-l-2 border-blue-400">
                      <p className="text-xs text-gray-600 font-semibold">
                        Input
                      </p>
                      <p className="text-sm text-gray-800 font-mono">
                        {stage.input}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 border-l-2 border-green-400">
                      <p className="text-xs text-gray-600 font-semibold">
                        Output
                      </p>
                      <p className="text-sm text-gray-800 font-mono">
                        {stage.output}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Pipeline Complete</p>
                <p className="text-sm text-gray-600">
                  {stages.length} stages processed successfully
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">✓</p>
                <p className="text-xs text-gray-600">Ready for queries</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>
            No pipeline data available. Upload documents to start processing.
          </p>
        </div>
      )}
    </div>
  );
}
