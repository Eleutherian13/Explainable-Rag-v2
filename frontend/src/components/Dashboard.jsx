import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import DocumentUpload from "./DocumentUpload";
import QueryForm from "./QueryForm";
import GraphVisualization from "./GraphVisualization";
import ErrorAlert from "./ErrorAlert";
import { BarChart3, Info } from "lucide-react";

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
              <div className="border-b border-gray-200 flex flex-wrap">
                <button
                  onClick={() => setActiveTab("answer")}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "answer"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Answer
                </button>
                <button
                  onClick={() => setActiveTab("graph")}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "graph"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Graph
                </button>
                <button
                  onClick={() => setActiveTab("entities")}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "entities"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Entities
                </button>
                <button
                  onClick={() => setActiveTab("sources")}
                  className={`px-6 py-3 font-medium transition-colors ${
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
                {activeTab === "answer" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Answer</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {results.answer || "No answer available"}
                    </p>
                  </div>
                )}
                {activeTab === "graph" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Knowledge Graph</h3>
                    <GraphVisualization graphData={results.graph_data} />
                  </div>
                )}
                {activeTab === "entities" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Entities</h3>
                    {results.entities && results.entities.length > 0 ? (
                      <div className="space-y-2">
                        {results.entities.map((entity, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                            <span className="font-medium text-gray-900">{entity.name}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {entity.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No entities found</p>
                    )}
                  </div>
                )}
                {activeTab === "sources" && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Source Snippets</h3>
                    {results.snippets && results.snippets.length > 0 ? (
                      <div className="space-y-3">
                        {results.snippets.map((snippet, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded border border-gray-200">
                            <p className="text-sm text-gray-600 font-semibold mb-2">Snippet {idx + 1}</p>
                            <p className="text-gray-700 text-sm">{snippet}</p>
                          </div>
                        ))}
                      </div>
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
