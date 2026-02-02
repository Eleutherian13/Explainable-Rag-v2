import React, { useState, useEffect } from "react";
import { ChevronDown, Highlighter, X, Badge, CheckCircle } from "lucide-react";

// PHASE 3: Utility function to split text into sentences
const extractSentences = (text) => {
  if (!text) return [];
  // Simple sentence splitting by . ! ? followed by space or end
  const sentenceRegex = /[^.!?]*[.!?]+/g;
  const matches = text.match(sentenceRegex) || [];
  return matches.map((s) => s.trim()).filter((s) => s.length > 0);
};

export default function DocumentHighlighter({ snippets, citations, chunkReferences, answerEntities = [] }) {
  const [selectedChunkIdx, setSelectedChunkIdx] = useState(0);
  const [highlightedText, setHighlightedText] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [sentenceView, setSentenceView] = useState(false);  // PHASE 3
  const [selectedEntityFilter, setSelectedEntityFilter] = useState(null);  // PHASE 3

  const currentSnippet = snippets?.[selectedChunkIdx] || "";
  const currentReference = chunkReferences?.[selectedChunkIdx] || {};
  const currentSentences = sentenceView ? extractSentences(currentSnippet) : [];  // PHASE 3

  useEffect(() => {
    // Clear highlights when chunk changes
    setHighlights([]);
    setHighlightedText(null);
  }, [selectedChunkIdx]);

  const handleCitationClick = (chunkIdx) => {
    setSelectedChunkIdx(chunkIdx);
    setHighlights([chunkIdx]);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection().toString();
    if (selection.length > 0) {
      setHighlightedText(selection);
    }
  };

  // PHASE 3: Check if sentence contains entity
  const sentenceContainsEntity = (sentence, entity) => {
    if (!entity) return true;
    return sentence.toLowerCase().includes(entity.name.toLowerCase());
  };

  // PHASE 3: Get confidence badge for sentence
  const getSentenceConfidence = (sentence, relatedEntities) => {
    const matchedEntities = relatedEntities.filter((e) =>
      sentence.toLowerCase().includes(e.name.toLowerCase())
    );
    return {
      score: Math.min(0.5 + (matchedEntities.length * 0.1), 1.0),
      matchedCount: matchedEntities.length,
      entities: matchedEntities,
    };
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

      {/* PHASE 3: View Toggle */}
      <div className="bg-white rounded-lg shadow p-3 flex gap-2 items-center border border-gray-200">
        <label className="text-sm font-medium text-gray-700">View Mode:</label>
        <button
          onClick={() => setSentenceView(false)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            !sentenceView ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Full Text
        </button>
        <button
          onClick={() => setSentenceView(true)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            sentenceView ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Sentence View
        </button>

        {/* PHASE 3: Entity Filter */}
        {answerEntities && answerEntities.length > 0 && sentenceView && (
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => setSelectedEntityFilter(null)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                !selectedEntityFilter ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              All
            </button>
            {answerEntities.slice(0, 3).map((entity) => (
              <button
                key={entity.name}
                onClick={() => setSelectedEntityFilter(entity.name)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedEntityFilter === entity.name ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {entity.name}
              </button>
            ))}
          </div>
        )}
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

        {/* Document Content - Full Text View */}
        {!sentenceView && (
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
        )}

        {/* PHASE 3: Sentence-Level Evidence View */}
        {sentenceView && (
          <div className="p-6 bg-gray-50 min-h-64 max-h-96 overflow-y-auto space-y-2">
            {currentSentences.length > 0 ? (
              currentSentences.map((sentence, idx) => {
                const isFiltered =
                  !selectedEntityFilter || sentenceContainsEntity(sentence, { name: selectedEntityFilter });
                const confidence = getSentenceConfidence(sentence, answerEntities || []);
                const confidencePercent = Math.round(confidence.score * 100);

                if (!isFiltered) return null;

                return (
                  <div
                    key={idx}
                    className="p-3 bg-white border-l-4 border-blue-300 rounded hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* Confidence Indicator */}
                      <div className="flex-shrink-0 pt-0.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: `hsl(${confidencePercent * 1.2}, 70%, 50%)`,
                          }}
                          title={`${confidencePercent}% confidence`}
                        ></div>
                      </div>

                      {/* Sentence Content */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 leading-relaxed">{sentence}</p>

                        {/* PHASE 3: Entity Badges */}
                        {confidence.matchedCount > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {confidence.entities.map((entity) => (
                              <span
                                key={entity.name}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                              >
                                <Badge className="w-3 h-3" />
                                {entity.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Relevance Pill */}
                      <div className="flex-shrink-0 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {confidencePercent}%
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 italic">No sentences to display</p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-100 p-3 border-t border-gray-200 text-xs text-gray-600 flex items-center justify-between">
          <span>💡 {sentenceView ? "Sentence view: highlighting related entities and confidence scores" : "Tip: Select text in the document to highlight it"}</span>
          {highlightedText && !sentenceView && (
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
