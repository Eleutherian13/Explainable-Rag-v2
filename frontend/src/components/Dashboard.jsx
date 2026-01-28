import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import DocumentUpload from "./DocumentUpload";
import QueryForm from "./QueryForm";
import GraphVisualization from "./GraphVisualization";
import ErrorAlert from "./ErrorAlert";
import PDFExport from "./PDFExport";
import DataPipeline from "./DataPipeline";
import EntityExplorer from "./EntityExplorer";
import DocumentHighlighter from "./DocumentHighlighter";
import { BarChart3, Info, Download, Map, Tag, BookOpen } from "lucide-react";

export default function Dashboard() {
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  
  const indexId = useAppStore((state) => state.indexId);
  const results = useAppStore((state) => state.results);

  useEffect(() => {
    if (results) {
      setShowResults(true);
      setActiveTab("answer");
    }
  }, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ErrorAlert />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Explainable RAG
            </h1>
          </div>
          <p className="text-gray-600">
            Knowledge Graphs with AI-Powered Insights
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Upload and Query Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <DocumentUpload />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <QueryForm />
            </div>
          </div>

          {/* Results Section */}
          {showResults && results && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200 flex flex-wrap overflow-x-auto">
                <button
                  onClick={() => setActiveTab("answer")}
                  className={`px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "answer"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>💡</span> Answer
                </button>
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "summary"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>📋</span> Summary
                </button>
                <button
                  onClick={() => setActiveTab("key-points")}
                  className={`px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "key-points"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>⭐</span> Key Points
                </button>
                <button
                  onClick={() => setActiveTab("graph")}
                  className={`px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "graph"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>🔗</span> Graph
                </button>
                <button
                  onClick={() => setActiveTab("entities")}
                  className={`px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "entities"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>🏷️</span> Entities
                </button>
                <button
                  onClick={() => setActiveTab("sources")}
                  className={`px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "sources"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>📄</span> Sources
                </button>
                <button
                  onClick={() => setActiveTab("pipeline")}
                  className={`px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "pipeline"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>🔄</span> Pipeline
                </button>
                <button
                  onClick={() => setActiveTab("export")}
                  className={`px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "export"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>⬇️</span> Export
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "answer" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">📝 Answer</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-base">
                        {results.answer || results.main_answer || "No answer available"}
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === "summary" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">📋 Summary</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-gray-900">
                        {results.summary || "No summary available"}
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === "key-points" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">⭐ Key Points</h3>
                    {results.key_points && results.key_points.length > 0 ? (
                      <ul className="space-y-2">
                        {results.key_points.map((point, idx) => (
                          <li key={idx} className="flex gap-3 p-3 bg-purple-50 rounded-lg">
                            <span className="text-purple-600 font-bold">{idx + 1}.</span>
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No key points available</p>
                    )}
                  </div>
                )}
                {activeTab === "graph" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">🔗 Knowledge Graph</h3>
                    <GraphVisualization graphData={results.graph_data} />
                  </div>
                )}
                {activeTab === "entities" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">🏷️ Entities & Actions</h3>
                    <EntityExplorer 
                      entities={results.entities || []} 
                      sessionId={indexId}
                    />
                  </div>
                )}
                {activeTab === "sources" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">📄 Source Documents & Highlighting</h3>
                    <DocumentHighlighter 
                      snippets={results.snippets || []}
                      citations={results.citations || []}
                      chunkReferences={results.chunk_references || []}
                    />
                  </div>
                )}
                {activeTab === "pipeline" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">🔄 Data Pipeline</h3>
                    <DataPipeline sessionId={indexId} />
                  </div>
                )}
                {activeTab === "pipeline" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">🔄 Data Pipeline</h3>
                    <DataPipeline pipelineData={results.pipeline_data} />
                  </div>
                )}
                {activeTab === "export" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">⬇️ Export Results</h3>
                    <PDFExport 
                      results={results}
                      query={results.query || ""}
                    />
                  </div>
                )}
                {activeTab === "entities" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">🏷️ Extracted Entities</h3>
                    <EntityExplorer 
                      entities={results.entities || []}
                      sessionId={sessionId}
                    />
                  </div>
                )}
                {activeTab === "sources" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">📄 Source Documents</h3>
                    <DocumentHighlighter 
                      chunks={results.chunks || []}
                      citations={results.citations || []}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {!showResults && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">Upload documents and ask a question to see results</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>Explainable RAG with Knowledge Graphs © 2026</p>
        </div>
      </footer>
    </div>
  );
}
