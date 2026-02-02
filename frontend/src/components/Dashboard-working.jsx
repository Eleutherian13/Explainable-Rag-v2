import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import DocumentUpload from "./DocumentUpload";
import QueryForm from "./QueryForm";
import GraphVisualization from "./GraphVisualization";
import ErrorAlert from "./ErrorAlert";
import { BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("answer");

  const results = useAppStore((state) => state.results);
  const error = useAppStore((state) => state.error);

  useEffect(() => {
    console.log("Results updated:", results);
    if (results) {
      setShowResults(true);
      setActiveTab("answer");
    }
  }, [results]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ErrorAlert />

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Explainable RAG
              </h1>
              <p className="text-gray-600 text-sm">
                Knowledge Graphs with AI-Powered Insights
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <DocumentUpload />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <QueryForm />
          </div>
        </div>

        {/* Results Section */}
        {showResults && results ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-8">
                {["answer", "graph", "entities", "sources"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === "answer" && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Answer</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {results.answer || "No answer available"}
                  </div>
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
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <span className="font-medium">{entity.name}</span>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {entity.type || "UNKNOWN"}
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
                        <div
                          key={idx}
                          className="p-3 bg-gray-100 rounded text-sm"
                        >
                          <p className="text-gray-600 font-semibold mb-1">
                            Source {idx + 1}
                          </p>
                          <p className="text-gray-700">{snippet}</p>
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
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">
              Upload documents and ask a question to see results here
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          Explainable RAG with Knowledge Graphs © 2026
        </div>
      </footer>
    </div>
  );
}
