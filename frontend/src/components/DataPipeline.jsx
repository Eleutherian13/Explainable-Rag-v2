import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader,
  Clock,
  Database,
  Zap,
  Eye,
  Info,
} from "lucide-react";
import api from "../services/api";

// PHASE 7: Enhanced stage definitions with descriptions and metrics
const documentProcessingStages = [
  {
    id: "upload",
    name: "Document Upload",
    icon: "📤",
    description: "Parse and read uploaded files",
    metrics: ["files_uploaded", "total_bytes"],
  },
  {
    id: "preprocessing",
    name: "Preprocessing & Chunking",
    icon: "✂️",
    description: "Clean text and split into chunks for processing",
    metrics: ["chunks_created", "avg_chunk_size", "total_tokens"],
  },
  {
    id: "embedding",
    name: "Embedding Generation",
    icon: "🔢",
    description: "Convert each chunk to semantic vectors",
    metrics: ["embeddings_created", "embedding_dim", "processing_time_ms"],
  },
  {
    id: "indexing",
    name: "Vector Indexing (FAISS)",
    icon: "🗂️",
    description: "Build searchable FAISS index for semantic search",
    metrics: ["index_size_mb", "total_vectors", "index_type"],
  },
  {
    id: "entity_extraction",
    name: "Entity Extraction",
    icon: "🏷️",
    description: "Extract named entities from chunks using NER",
    metrics: ["entities_found", "entity_types", "avg_entities_per_chunk"],
  },
  {
    id: "graph_building",
    name: "Knowledge Graph Construction",
    icon: "🔗",
    description: "Build entity relationships and construct knowledge graph",
    metrics: ["graph_nodes", "graph_edges", "graph_density"],
  },
];

const queryProcessingStages = [
  {
    id: "retrieval",
    name: "Semantic Retrieval",
    icon: "🔍",
    description: "Find most relevant document chunks using embeddings",
    metrics: ["chunks_retrieved", "top_k", "retrieval_time_ms"],
  },
  {
    id: "answer_generation",
    name: "Answer Generation",
    icon: "💡",
    description: "Generate answer using LLM with retrieved context",
    metrics: ["tokens_used", "model_used", "generation_time_ms"],
  },
  {
    id: "citation",
    name: "Citation Extraction",
    icon: "📌",
    description: "Link answer sentences to source documents",
    metrics: ["citations_found", "avg_citation_quality", "coverage_percent"],
  },
];

export default function DataPipeline({ sessionId, queryData }) {
  const [pipelineData, setPipelineData] = useState(null);
  const [pipelineInfo, setPipelineInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDocStage, setExpandedDocStage] = useState(null);
  const [expandedQueryStage, setExpandedQueryStage] = useState(null);
  const [showMetrics, setShowMetrics] = useState(true);

  useEffect(() => {
    fetchPipelineData();
    fetchPipelineInfo();
  }, [sessionId, queryData]);

  const fetchPipelineData = async () => {
    try {
      if (!sessionId) return;
      const response = await api.get(`/pipeline-visualization/${sessionId}`);
      setPipelineData(response.data);
    } catch (err) {
      console.error("Pipeline error:", err);
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

  // PHASE 7: Format metric values for display
  const formatMetricValue = (value) => {
    if (typeof value === "number") {
      if (value > 1000000) {
        return (value / 1000000).toFixed(2) + "M";
      }
      if (value > 1000) {
        return (value / 1000).toFixed(2) + "K";
      }
      return value.toFixed(2);
    }
    return String(value);
  };

  // PHASE 7: Get stage data from pipeline or return default
  const getStageData = (stageId, source = "stages") => {
    if (!pipelineData) return {};
    const stageArray = source === "query" ? pipelineData.query_stages : pipelineData.stages;
    const stage = stageArray?.find((s) => s.id === stageId);
    return stage?.data || {};
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
      {/* PHASE 7: Controls Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-900">
            Reasoning Pipeline Transparency
          </span>
        </div>
        <button
          onClick={() => setShowMetrics(!showMetrics)}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-md transition-colors flex items-center gap-1"
        >
          {showMetrics ? (
            <>
              <Eye className="w-4 h-4" /> Hide Metrics
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" /> Show Metrics
            </>
          )}
        </button>
      </div>

      {/* PHASE 7: Document Processing Pipeline Timeline */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          📊 Document Processing Pipeline
        </h3>
        <p className="text-xs text-gray-600 mb-6">
          Expand any stage to see intermediate artifacts and processing metrics
        </p>

        <div className="space-y-3">
          {documentProcessingStages.map((stage, idx) => {
            const stageData = getStageData(stage.id);
            const isExpanded = expandedDocStage === stage.id;

            return (
              <div key={stage.id}>
                {/* Stage Header - Clickable */}
                <button
                  onClick={() =>
                    setExpandedDocStage(isExpanded ? null : stage.id)
                  }
                  className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 border border-blue-300 rounded-lg p-4 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Step Counter */}
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>

                      {/* Stage Icon and Name */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{stage.icon}</span>
                          <h4 className="font-bold text-gray-900">
                            {stage.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-700">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </button>

                {/* PHASE 7: Expandable Details Panel */}
                {isExpanded && (
                  <div className="bg-blue-50 border-l-4 border-blue-600 border-r border-b border-blue-200 rounded-b-lg p-4 mt-0">
                    {/* Metrics Display */}
                    {showMetrics && Object.keys(stageData).length > 0 ? (
                      <div>
                        <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4" /> Processing Metrics
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(stageData).map(([key, value]) => (
                            <div
                              key={key}
                              className="bg-white border border-blue-200 rounded p-3"
                            >
                              <div className="text-xs font-semibold text-gray-700 capitalize">
                                {key.replace(/_/g, " ")}
                              </div>
                              <div className="text-lg font-bold text-blue-600 mt-1">
                                {formatMetricValue(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        No metrics available for this stage yet
                      </p>
                    )}

                    {/* Stage Completion Indicator */}
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        ✓ Complete
                      </span>
                    </div>
                  </div>
                )}

                {/* Vertical Connector Line */}
                {idx < documentProcessingStages.length - 1 && (
                  <div className="h-2 bg-gradient-to-b from-blue-300 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PHASE 7: Query Processing Pipeline Timeline */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          ⚡ Query Processing Pipeline
        </h3>
        <p className="text-xs text-gray-600 mb-6">
          Real-time processing stages for each query submission
        </p>

        <div className="space-y-3">
          {queryProcessingStages.map((stage, idx) => {
            const stageData = getStageData(stage.id, "query");
            const isExpanded = expandedQueryStage === stage.id;

            return (
              <div key={stage.id}>
                {/* Stage Header - Clickable */}
                <button
                  onClick={() =>
                    setExpandedQueryStage(isExpanded ? null : stage.id)
                  }
                  className="w-full bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-150 border border-purple-300 rounded-lg p-4 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Step Counter */}
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>

                      {/* Stage Icon and Name */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{stage.icon}</span>
                          <h4 className="font-bold text-gray-900">
                            {stage.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-700">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </button>

                {/* PHASE 7: Expandable Details Panel */}
                {isExpanded && (
                  <div className="bg-purple-50 border-l-4 border-purple-600 border-r border-b border-purple-200 rounded-b-lg p-4 mt-0">
                    {/* Metrics Display */}
                    {showMetrics && Object.keys(stageData).length > 0 ? (
                      <div>
                        <h5 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Processing Metrics
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(stageData).map(([key, value]) => (
                            <div
                              key={key}
                              className="bg-white border border-purple-200 rounded p-3"
                            >
                              <div className="text-xs font-semibold text-gray-700 capitalize">
                                {key.replace(/_/g, " ")}
                              </div>
                              <div className="text-lg font-bold text-purple-600 mt-1">
                                {formatMetricValue(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        No metrics available for this stage yet
                      </p>
                    )}

                    {/* Stage Completion Indicator */}
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        ✓ Complete
                      </span>
                    </div>
                  </div>
                )}

                {/* Vertical Connector Line */}
                {idx < queryProcessingStages.length - 1 && (
                  <div className="h-2 bg-gradient-to-b from-purple-300 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Stack Information */}
      {pipelineInfo && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            🛠️ Technology Stack
          </h3>
          <p className="text-xs text-gray-600 mb-6">
            Technologies used at each stage of the reasoning pipeline
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(pipelineInfo.components || {}).map(
              ([name, info]) => (
                <div
                  key={name}
                  className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-gray-50 to-white"
                >
                  <h4 className="font-bold text-gray-900 mb-2">{name}</h4>
                  <p className="text-xs text-gray-700 mb-3">
                    {info.description}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-gray-700 block mb-1">
                        Technologies:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {info.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-semibold"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-700 block mb-1">
                        Output:
                      </span>
                      <span className="text-xs text-gray-600">
                        {info.output}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* PHASE 7: Pipeline Explanation */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-600" /> How the Pipeline Works
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <span className="font-semibold text-indigo-900">1. Document Processing:</span>{" "}
            First, uploaded documents are parsed, cleaned, and split into chunks.
            Each chunk is converted to a semantic vector (embedding) and indexed
            in FAISS for fast retrieval.
          </div>
          <div>
            <span className="font-semibold text-indigo-900">2. Knowledge Extraction:</span>{" "}
            Named entities are extracted from chunks and relationships are built
            to create a knowledge graph. This enables graph-based explanations.
          </div>
          <div>
            <span className="font-semibold text-indigo-900">3. Query Processing:</span>{" "}
            When you submit a query, the most relevant chunks are retrieved
            semantically. The retrieved context is passed to an LLM to generate
            an answer.
          </div>
          <div>
            <span className="font-semibold text-indigo-900">4. Answer Grounding:</span>{" "}
            Citations are extracted to link each answer sentence back to source
            chunks. This ensures answer transparency and verifiability.
          </div>
        </div>
      </div>
    </div>
  );
}
