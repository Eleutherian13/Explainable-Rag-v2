import React, { useEffect, useState, useMemo } from "react";
import { useAppStore } from "../store/appStore";
import DocumentUpload from "./DocumentUpload";
import QueryForm from "./QueryForm";
import ErrorAlert from "./ErrorAlert";
import EnhancedAnswerPanel from "./EnhancedAnswerPanel";
import EnhancedEntitiesPanel from "./EnhancedEntitiesPanel";
import SourcesPanel from "./SourcesPanel";
import EnhancedPipelineView from "./EnhancedPipelineView";
import { Tabs, TabPanel } from "./ui/Tabs";
import { Card, CardContent } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { EmptyState } from "./ui/Common";
import {
  Brain,
  FileText,
  MessageSquare,
  Network,
  Tag,
  BookOpen,
  Workflow,
  Sparkles,
  Upload,
  Search,
  ChevronRight,
  Zap,
  Shield,
  Eye,
} from "lucide-react";

export default function Dashboard() {
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("answer");
  const [focusedEntity, setFocusedEntity] = useState(null);
  const [highlightedSource, setHighlightedSource] = useState(null);

  const results = useAppStore((state) => state.results);
  const sessionId = useAppStore((state) => state.indexId); // indexId is the session ID
  const processingStatus = useAppStore((state) => state.processingStatus);
  const isLoading = useAppStore((state) => state.loading); // loading not isLoading

  useEffect(() => {
    if (results) {
      setShowResults(true);
      setActiveTab("answer");
    }
  }, [results]);

  // Handler for cross-panel navigation
  const handleFocusEntity = (entity) => {
    setFocusedEntity(entity);
    setActiveTab("graph");
  };

  const handleShowSourcesForEntity = (entity) => {
    setHighlightedSource(entity.name);
    setActiveTab("sources");
  };

  const handleNavigateToEntity = (entityName) => {
    const entity = results?.entities?.find(
      (e) => e.name.toLowerCase() === entityName.toLowerCase(),
    );
    if (entity) {
      setFocusedEntity(entity);
      setActiveTab("entities");
    }
  };

  // Handler for regenerating with entity focus
  const handleRegenerateWithEntity = (entity) => {
    // Add entity context to query and re-submit
    const enhancedQuery = `${query} (focusing on ${entity.name})`;
    // For now, show an alert - in full implementation, this would trigger a new query
    alert(
      `Would regenerate query focusing on: ${entity.name}\nNew query: "${enhancedQuery}"`,
    );
  };

  // Handler for "What If?" - excluding an entity
  const handleExcludeEntity = (entity) => {
    // In full implementation, this would re-run the pipeline excluding this entity
    alert(`"What If" mode: Would regenerate answer excluding: ${entity.name}`);
  };

  // Calculate stats for header
  const stats = useMemo(() => {
    if (!results) return null;
    return {
      entities: results.entities?.length || 0,
      sources: results.snippets?.length || 0,
      confidence: results.confidence_score
        ? Math.round(results.confidence_score * 100)
        : null,
    };
  }, [results]);

  // Tab configuration
  const tabs = [
    {
      id: "answer",
      label: "Answer",
      icon: MessageSquare,
      badge: stats?.confidence ? `${stats.confidence}%` : null,
    },
    {
      id: "sources",
      label: "Sources",
      icon: BookOpen,
      badge: stats?.sources || null,
    },
    {
      id: "entities",
      label: "Entities",
      icon: Tag,
      badge: stats?.entities || null,
    },
    {
      id: "pipeline",
      label: "Pipeline",
      icon: Workflow,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <ErrorAlert />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Explainable RAG
                </h1>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Knowledge Graphs with AI-Powered Insights
                </p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-4">
              {sessionId && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-emerald-700">
                    Session Active
                  </span>
                </div>
              )}
              {isLoading && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium text-blue-700">
                    Processing...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Feature Highlights (shown when no session) */}
        {!sessionId && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <Eye className="w-8 h-8 mb-3 opacity-90" />
              <h3 className="font-semibold text-lg mb-1">
                Transparent Reasoning
              </h3>
              <p className="text-blue-100 text-sm">
                See exactly how answers are generated from your documents
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <Network className="w-8 h-8 mb-3 opacity-90" />
              <h3 className="font-semibold text-lg mb-1">Knowledge Graphs</h3>
              <p className="text-purple-100 text-sm">
                Visual entity relationships with interactive exploration
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
              <Shield className="w-8 h-8 mb-3 opacity-90" />
              <h3 className="font-semibold text-lg mb-1">Source Grounding</h3>
              <p className="text-emerald-100 text-sm">
                Every claim linked to original document passages
              </p>
            </div>
          </div>
        )}

        {/* Upload & Query Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Document Upload */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <Upload className="w-5 h-5" />
                <h2 className="font-semibold">Upload Documents</h2>
              </div>
            </div>
            <CardContent className="p-6">
              <DocumentUpload />
            </CardContent>
          </Card>

          {/* Query Form */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <Search className="w-5 h-5" />
                <h2 className="font-semibold">Ask a Question</h2>
              </div>
            </div>
            <CardContent className="p-6">
              <QueryForm />
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {showResults && results ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Results Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Query Results</h2>
                    <p className="text-sm text-gray-500">
                      {results.query || "Analysis complete"}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                {stats && (
                  <div className="hidden md:flex items-center gap-4">
                    {stats.confidence && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Confidence</p>
                        <p
                          className={`text-lg font-bold ${
                            stats.confidence >= 70
                              ? "text-emerald-600"
                              : stats.confidence >= 40
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {stats.confidence}%
                        </p>
                      </div>
                    )}
                    <div className="w-px h-8 bg-gray-300" />
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Sources</p>
                      <p className="text-lg font-bold text-gray-900">
                        {stats.sources}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Entities</p>
                      <p className="text-lg font-bold text-gray-900">
                        {stats.entities}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Graph</p>
                      <p className="text-lg font-bold text-gray-900">
                        {stats.graphNodes}
                        <span className="text-sm font-normal text-gray-400">
                          {" "}
                          nodes
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 bg-white px-6">
              <div className="flex gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setFocusedEntity(null);
                        setHighlightedSource(null);
                      }}
                      className={`
                        flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all
                        border-b-2 whitespace-nowrap
                        ${
                          isActive
                            ? "border-blue-600 text-blue-600 bg-blue-50/50"
                            : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }
                      `}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      {tab.label}
                      {tab.badge !== null && (
                        <Badge
                          variant={isActive ? "primary" : "default"}
                          size="xs"
                        >
                          {tab.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "answer" && (
                <EnhancedAnswerPanel
                  answer={results.answer}
                  query={results.query}
                  entities={results.entities}
                  snippets={results.snippets}
                  confidenceScore={results.confidence_score}
                  onEntityClick={handleNavigateToEntity}
                  onSourceClick={() => setActiveTab("sources")}
                />
              )}

              {activeTab === "sources" && (
                <SourcesPanel
                  snippets={results.snippets}
                  entities={results.entities}
                  answer={results.answer}
                  chunkReferences={results.chunk_references || []}
                  citations={results.citations || []}
                  onEntityClick={handleNavigateToEntity}
                  onGraphFocus={(entity) => {
                    setFocusedEntity(entity);
                    setActiveTab("graph");
                  }}
                />
              )}

              {activeTab === "entities" && (
                <EnhancedEntitiesPanel
                  entities={results.entities}
                  answer={results.answer}
                  snippets={results.snippets}
                  focusedEntity={focusedEntity}
                  onShowSources={handleShowSourcesForEntity}
                  onFocusGraph={handleFocusEntity}
                  onRegenerateWithEntity={handleRegenerateWithEntity}
                  onExcludeEntity={handleExcludeEntity}
                />
              )}

              {activeTab === "pipeline" && (
                <EnhancedPipelineView
                  sessionId={sessionId}
                  processingStatus={processingStatus}
                  queryData={{
                    query: results.query,
                    snippets: results.snippets,
                    answer: results.answer,
                    entities: results.entities,
                    confidence_score: results.confidence_score,
                    citations: results.citations,
                    answer_entities: results.answer_entities,
                    top_k: 5,
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <Card className="p-12">
            <EmptyState
              icon={FileText}
              title="Ready to Explore"
              description="Upload your documents and ask questions to get explainable, grounded answers with knowledge graph visualizations."
            />
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Upload PDF, TXT, or DOCX</span>
              </div>
              <ChevronRight className="w-4 h-4" />
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Ask a question</span>
              </div>
              <ChevronRight className="w-4 h-4" />
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                <span>Explore answers</span>
              </div>
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Brain className="w-5 h-5" />
              <span className="font-medium">Explainable RAG</span>
              <span className="text-gray-400">|</span>
              <span className="text-sm">Knowledge Graphs with AI</span>
            </div>
            <div className="text-sm text-gray-500">
              Built with FastAPI, React, and ❤️ © 2026
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
