import React, { useState, useEffect } from "react";
import { ArrowRight, Loader } from "lucide-react";
import api from "../services/api";

const stages = [
  { id: "upload", name: "Document Upload", icon: "📤" },
  { id: "preprocessing", name: "Preprocessing", icon: "✂️" },
  { id: "embedding", name: "Embeddings", icon: "🔢" },
  { id: "indexing", name: "Indexing", icon: "🗂️" },
  { id: "entity_extraction", name: "Entities", icon: "🏷️" },
  { id: "graph_building", name: "Graph", icon: "🔗" }
];

const queryStages = [
  { id: "retrieval", name: "Retrieval", icon: "🔍" },
  { id: "answer_generation", name: "Answer", icon: "💡" },
  { id: "citation", name: "Citation", icon: "📌" }
];

export default function DataPipeline({ sessionId }) {
  const [pipelineData, setPipelineData] = useState(null);
  const [pipelineInfo, setPipelineInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStage, setExpandedStage] = useState(null);

  useEffect(() => {
    fetchPipelineData();
    fetchPipelineInfo();
  }, [sessionId]);

  const fetchPipelineData = async () => {
    try {
      if (!sessionId) return;
      const response = await api.get(`/pipeline-visualization/${sessionId}`);
      setPipelineData(response.data);
    } catch (err) {
      console.error("Pipeline error:", err);
      setError("Failed to load pipeline data");
    }
  };

  const fetchPipelineInfo = async () => {
    try {
      const response = await api.get("/pipeline-info");
      setPipelineInfo(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Pipeline info error:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading pipeline...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Upload/Processing Pipeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span>📊</span> Document Processing Pipeline
        </h3>

        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {stages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div
                onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                className="flex-shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all min-w-[140px]"
              >
                <div className="text-3xl mb-2">{stage.icon}</div>
                <div className="text-sm font-semibold text-gray-700">{stage.name}</div>
                <div className="text-xs text-gray-600 mt-1">✓ Complete</div>
              </div>
              {idx < stages.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {expandedStage && pipelineData && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">
              {stages.find(s => s.id === expandedStage)?.name} Details
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              {Object.entries(pipelineData.stages.find(s => s.id === expandedStage)?.data || {}).map(
                ([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-semibold">{JSON.stringify(value)}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Query Pipeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span>⚡</span> Query Processing Pipeline
        </h3>

        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {queryStages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-4 min-w-[140px]">
                <div className="text-3xl mb-2">{stage.icon}</div>
                <div className="text-sm font-semibold text-gray-700">{stage.name}</div>
                <div className="text-xs text-gray-600 mt-1">✓ Realtime</div>
              </div>
              {idx < queryStages.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      {pipelineInfo && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-6">🛠️ Technology Stack</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(pipelineInfo.components || {}).map(([name, info]) => (
              <div key={name} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{name}</h4>
                <p className="text-xs text-gray-600 mb-2">{info.description}</p>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="font-semibold text-gray-700">Tech:</span>{" "}
                    {info.technologies.join(", ")}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Output:</span> {info.output}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
