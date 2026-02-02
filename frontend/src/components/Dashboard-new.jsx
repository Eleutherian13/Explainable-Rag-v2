import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import DocumentUpload from "./DocumentUpload";
import QueryForm from "./QueryForm";
import ResultsPanel from "./ResultsPanel";
import GraphVisualization from "./GraphVisualization";
import ErrorAlert from "./ErrorAlert";
import { BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [debugInfo, setDebugInfo] = useState("Loading...");

  const indexId = useAppStore((state) => state.indexId);
  const results = useAppStore((state) => state.results);
  const error = useAppStore((state) => state.error);
  const loading = useAppStore((state) => state.loading);

  useEffect(() => {
    // Debug info
    setDebugInfo(
      `IndexId: ${indexId || "None"}, Results: ${results ? "Yes" : "No"}, Error: ${error || "None"}`,
    );

    if (results) {
      setShowResults(true);
      setActiveTab("graph");
    }
  }, [results, indexId, error]);

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
          <p className="text-xs text-gray-400 mt-2">Debug: {debugInfo}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Upload and Query Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow">
              <DocumentUpload />
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <QueryForm />
            </div>
          </div>

          {/* Results Section */}
          {showResults && results && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200 flex">
                <button
                  onClick={() => setActiveTab("graph")}
                  className={`px-6 py-3 font-medium ${
                    activeTab === "graph"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Knowledge Graph
                </button>
                <button
                  onClick={() => setActiveTab("answer")}
                  className={`px-6 py-3 font-medium ${
                    activeTab === "answer"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Answer
                </button>
                <button
                  onClick={() => setActiveTab("entities")}
                  className={`px-6 py-3 font-medium ${
                    activeTab === "entities"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Entities
                </button>
                <button
                  onClick={() => setActiveTab("sources")}
                  className={`px-6 py-3 font-medium ${
                    activeTab === "sources"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Sources
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "graph" && (
                  <GraphVisualization graphData={results.graph_data} />
                )}
                {activeTab === "answer" && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {results.answer}
                    </p>
                  </div>
                )}
                {activeTab === "entities" && (
                  <div className="space-y-2">
                    {results.entities && results.entities.length > 0 ? (
                      results.entities.map((entity, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {entity.name}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {entity.type}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No entities found</p>
                    )}
                  </div>
                )}
                {activeTab === "sources" && (
                  <div className="space-y-3">
                    {results.snippets && results.snippets.length > 0 ? (
                      results.snippets.map((snippet, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 rounded border border-gray-200"
                        >
                          <p className="text-sm text-gray-700">{snippet}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No sources available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {!showResults && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">
                Upload documents and ask a question to see results
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
