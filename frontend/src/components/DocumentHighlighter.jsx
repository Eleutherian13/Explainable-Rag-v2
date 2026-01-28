import React, { useState, useEffect } from "react";
import { ChevronDown, Highlighter, X } from "lucide-react";

export default function DocumentHighlighter({ snippets, citations, chunkReferences }) {
  const [selectedChunkIdx, setSelectedChunkIdx] = useState(0);
  const [highlightedText, setHighlightedText] = useState(null);
  const [highlights, setHighlights] = useState([]);

  const currentSnippet = snippets?.[selectedChunkIdx] || "";
  const currentReference = chunkReferences?.[selectedChunkIdx] || {};

  useEffect(() => {
    // Clear highlights when chunk changes
    setHighlights([]);
    setHighlightedText(null);
  }, [selectedChunkIdx]);

  const handleCitationClick = (chunkIdx) => {
    setSelectedChunkIdx(chunkIdx);
    setHighlights([chunkIdx]);
  };

  const highlightSearchTerm = (text, term) => {
    if (!term || !text) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.split(regex).map((part, idx) =>
      regex.test(part) ? `<mark>${part}</mark>` : part
    );
  };

  const handleTextSelection = () => {
    const selection = window.getSelection().toString();
    if (selection.length > 0) {
      setHighlightedText(selection);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Chunk Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          📄 Source Documents
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {snippets && snippets.length > 0 ? (
            snippets.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleCitationClick(idx)}
                className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm font-semibold transition-all ${
                  selectedChunkIdx === idx
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Chunk {idx + 1}
                {highlights.includes(idx) && <span className="ml-1">✓</span>}
              </button>
            ))
          ) : (
            <p className="text-gray-600 text-sm">No snippets available</p>
          )}
        </div>
      </div>

      {/* Document Viewer */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Document: {currentReference.filename || "Unknown"}</h3>
            <p className="text-sm text-blue-100 mt-1">
              Relevance: {(currentReference.relevance_score * 100).toFixed(0)}%
            </p>
          </div>
          <div className="text-3xl">📖</div>
        </div>

        {/* Document Content */}
        <div
          className="p-6 bg-gray-50 min-h-64 max-h-96 overflow-y-auto text-gray-800 leading-relaxed select-text"
          onMouseUp={handleTextSelection}
        >
          {currentSnippet ? (
            <div className="whitespace-pre-wrap">
              {highlightedText ? (
                <div>
                  <div className="text-sm text-blue-600 mb-2 font-semibold">
                    Selected: "{highlightedText}"
                  </div>
                  {currentSnippet.split(new RegExp(`(${highlightedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")).map((part, idx) =>
                    part.toLowerCase() === highlightedText.toLowerCase() ? (
                      <mark key={idx} className="bg-yellow-300 font-semibold">
                        {part}
                      </mark>
                    ) : (
                      part
                    )
                  )}
                </div>
              ) : (
                currentSnippet
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No content to display</p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-3 border-t border-gray-200 text-xs text-gray-600 flex items-center justify-between">
          <span>💡 Tip: Select text in the document to highlight it</span>
          {highlightedText && (
            <button
              onClick={() => setHighlightedText(null)}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear selection
            </button>
          )}
        </div>
      </div>

      {/* Citation Map */}
      {citations && citations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            🔗 Citation Map
          </h3>
          <div className="space-y-2">
            {citations.slice(0, 5).map((citation, idx) => (
              <div
                key={idx}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => handleCitationClick(citation.chunk_index)}
              >
                <div className="font-semibold text-blue-900 text-sm">
                  Chunk {citation.chunk_index} - Relevance: {(citation.relevance_score * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  "{citation.matched_text?.substring(0, 80)}..."
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
