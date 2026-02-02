import React, { useState, useMemo } from "react";
import {
  Workflow,
  FileText,
  Database,
  Cpu,
  Network,
  MessageSquare,
  BookOpen,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Info,
  Loader,
} from "lucide-react";
import { Badge, StatusBadge } from "./ui/Badge";
import { Card, CardContent } from "./ui/Card";
import { ProgressBar, Collapsible, EmptyState } from "./ui/Common";

/**
 * PHASE 7: Pipeline Transparency View
 * Shows end-to-end reasoning timeline with intermediate artifacts
 */
export default function EnhancedPipelineView({
  sessionId,
  processingStatus,
  queryData,
  isProcessing = false,
}) {
  const [expandedStep, setExpandedStep] = useState(null);

  // Determine if we have completed processing (have query results)
  const hasResults = queryData?.answer && queryData?.snippets?.length > 0;
  const hasDocuments = processingStatus?.documents?.length > 0 || hasResults;
  const hasChunks = processingStatus?.total_chunks > 0 || (queryData?.snippets?.length > 0);
  const hasEntities = processingStatus?.total_entities > 0 || (queryData?.entities?.length > 0);

  // Pipeline stages definition - all stages complete when we have results
  const pipelineStages = useMemo(() => {
    const stages = [
      {
        id: "document_upload",
        name: "Document Upload",
        icon: FileText,
        description: "Documents received and validated",
        status: hasDocuments ? "completed" : "idle",
        details: {
          documents: processingStatus?.documents || [],
          totalDocuments: processingStatus?.documents?.length || (hasResults ? "✓" : 0),
        },
      },
      {
        id: "chunking",
        name: "Text Chunking",
        icon: BookOpen,
        description: "Documents split into semantic chunks for processing",
        status: hasChunks ? "completed" : "idle",
        details: {
          totalChunks: processingStatus?.total_chunks || queryData?.snippets?.length || 0,
          avgChunkSize: "~300 words",
          overlap: "50 words",
        },
      },
      {
        id: "embedding",
        name: "Embedding Generation",
        icon: Cpu,
        description: "Text chunks converted to semantic vectors using sentence transformers",
        status: hasChunks ? "completed" : "idle",
        details: {
          model: "all-MiniLM-L6-v2",
          dimensions: 384,
          chunksEmbedded: processingStatus?.total_chunks || queryData?.snippets?.length || 0,
        },
      },
      {
        id: "indexing",
        name: "Vector Indexing (FAISS)",
        icon: Database,
        description: "Embeddings indexed in FAISS for fast similarity search",
        status: hasChunks ? "completed" : "idle",
        details: {
          indexType: "FAISS IndexFlatL2",
          indexedVectors: processingStatus?.total_chunks || queryData?.snippets?.length || 0,
          searchComplexity: "O(n) - Exact search",
        },
      },
      {
        id: "retrieval",
        name: "Semantic Retrieval",
        icon: Database,
        description: "Top-K most relevant chunks retrieved based on query similarity",
        status: queryData?.snippets?.length > 0 ? "completed" : "idle",
        details: {
          query: queryData?.query || "",
          topK: queryData?.top_k || 5,
          chunksRetrieved: queryData?.snippets?.length || 0,
          method: "Cosine Similarity",
        },
      },
      {
        id: "entity_extraction",
        name: "Entity Extraction",
        icon: Network,
        description: "Named entities extracted using pattern matching and NLP",
        status: hasEntities ? "completed" : "idle",
        details: {
          method: "Regex + Pattern Matching",
          entitiesFound: queryData?.entities?.length || processingStatus?.total_entities || 0,
          types: "PERSON, ORG, DATE, LOCATION, etc.",
        },
      },
      {
        id: "context_assembly",
        name: "Context Assembly",
        icon: BookOpen,
        description: "Retrieved chunks assembled into coherent context for LLM",
        status: queryData?.snippets?.length > 0 ? "completed" : "idle",
        details: {
          contextChunks: queryData?.snippets?.length || 0,
          entities: queryData?.entities?.length || 0,
          contextWindow: "Optimized for LLM input",
        },
      },
      {
        id: "llm_generation",
        name: "RAG Answer Generation",
        icon: MessageSquare,
        description: "LLM generates grounded answer from retrieved context",
        status: queryData?.answer ? "completed" : "idle",
        details: {
          model: "Groq LLaMA 3.1 8B",
          provider: "Groq Cloud API",
          answerLength: queryData?.answer?.length || 0,
          grounded: "Yes - Based on retrieved sources",
        },
      },
      {
        id: "llm_polishing",
        name: "LLM Response Polishing",
        icon: Cpu,
        description: "Final answer refined and formatted by LLM for clarity",
        status: queryData?.answer ? "completed" : "idle",
        details: {
          confidence: queryData?.confidence_score
            ? `${Math.round(queryData.confidence_score * 100)}%`
            : "N/A",
          citations: queryData?.citations?.length || 0,
          answerEntities: queryData?.answer_entities?.length || 0,
        },
      },
    ];

    return stages;
  }, [processingStatus, queryData, hasDocuments, hasChunks, hasEntities, hasResults]);

  // Calculate overall progress
  const completedStages = pipelineStages.filter(
    (s) => s.status === "completed",
  ).length;
  const overallProgress = (completedStages / pipelineStages.length) * 100;

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "processing":
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500";
      case "processing":
        return "bg-blue-500 animate-pulse";
      default:
        return "bg-gray-300";
    }
  };

  if (!sessionId && !queryData) {
    return (
      <EmptyState
        icon={Workflow}
        title="No Pipeline Data"
        description="Upload documents to see the processing pipeline."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Workflow className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">RAG Pipeline</h2>
            <p className="text-indigo-100 text-sm">
              End-to-end reasoning transparency
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>
              {completedStages} of {pipelineStages.length} stages
            </span>
          </div>
          <div className="w-full bg-indigo-400/30 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pipeline Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Stages */}
        <div className="space-y-4">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isExpanded = expandedStep === stage.id;
            const isLast = idx === pipelineStages.length - 1;

            return (
              <div key={stage.id} className="relative pl-14">
                {/* Timeline Node */}
                <div
                  className={`
                    absolute left-4 w-5 h-5 rounded-full border-4 border-white shadow-sm
                    ${getStatusColor(stage.status)}
                  `}
                  style={{ top: "1.25rem" }}
                />

                {/* Stage Card */}
                <Card
                  className={`
                    transition-all duration-200
                    ${stage.status === "processing" ? "ring-2 ring-blue-500" : ""}
                    ${isExpanded ? "shadow-lg" : ""}
                  `}
                  hover
                >
                  <button
                    className="w-full p-4 text-left"
                    onClick={() =>
                      setExpandedStep(isExpanded ? null : stage.id)
                    }
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${
                            stage.status === "completed"
                              ? "bg-emerald-100 text-emerald-600"
                              : stage.status === "processing"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-400"
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800">
                            {stage.name}
                          </h4>
                          {stage.status === "completed" && (
                            <Badge variant="success" size="xs">
                              Complete
                            </Badge>
                          )}
                          {stage.status === "processing" && (
                            <Badge variant="primary" size="xs">
                              Processing
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {stage.description}
                        </p>
                      </div>

                      {/* Status & Expand */}
                      <div className="flex items-center gap-2">
                        {getStatusIcon(stage.status)}
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <CardContent className="bg-gray-50 border-t border-gray-100 animate-slideDown">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Object.entries(stage.details).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mt-0.5">
                              {Array.isArray(value)
                                ? `${value.length} items`
                                : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Document list for upload stage */}
                      {stage.id === "document_upload" &&
                        stage.details.documents?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                              Processed Documents
                            </p>
                            <div className="space-y-2">
                              {stage.details.documents.map((doc, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700">
                                      {doc.filename}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        doc.status === "indexed"
                                          ? "success"
                                          : "default"
                                      }
                                      size="xs"
                                    >
                                      {doc.status}
                                    </Badge>
                                    {doc.chunks_count > 0 && (
                                      <span className="text-xs text-gray-500">
                                        {doc.chunks_count} chunks
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Query preview for retrieval stage */}
                      {stage.id === "retrieval" && stage.details.query && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                            Query
                          </p>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200 italic">
                            "{stage.details.query}"
                          </p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">About this pipeline</p>
          <p>
            This view shows how your documents are processed and how answers are
            generated. Each stage is expandable to show intermediate artifacts
            and processing details. This transparency helps you understand and
            validate the reasoning behind each answer.
          </p>
        </div>
      </div>
    </div>
  );
}
