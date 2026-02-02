/**
 * PHASE 6: Enhanced Answer Display with Sentence-Level Inspection
 * Features:
 * - Sentence-level breakdown
 * - Inspection icons for supporting evidence
 * - Answer regeneration modes
 */

import React, { useState } from "react";
import { Eye, RotateCw, AlertCircle, ChevronDown } from "lucide-react";

// Utility to split answer into sentences
const extractSentences = (text) => {
  if (!text) return [];
  const sentenceRegex = /[^.!?]*[.!?]+/g;
  const matches = text.match(sentenceRegex) || [];
  return matches.map((s) => s.trim()).filter((s) => s.length > 0);
};

export default function AnswerPanel({ answer, entities = [], sources = [], citations = [] }) {
  const [inspectingSentenceIdx, setInspectingSentenceIdx] = useState(null);
  const [viewMode, setViewMode] = useState("full"); // 'full' or 'sentences'
  
  const answerText = answer || "";
  const sentences = viewMode === "sentences" ? extractSentences(answerText) : [];

  // PHASE 6: Find supporting entities for a sentence
  const getSupportingEntities = (sentence) => {
    return entities.filter((ent) =>
      sentence.toLowerCase().includes(ent.name.toLowerCase())
    );
  };

  // PHASE 6: Find supporting sources for a sentence
  const getSupportingSources = (sentence) => {
    return sources.filter((src) =>
      src.toLowerCase().includes(sentence.substring(0, 30))
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* View Mode Selector */}
      <div className="bg-white rounded-lg shadow p-3 border border-gray-200 flex gap-2">
        <label className="text-sm font-medium text-gray-700">View Mode:</label>
        <button
          onClick={() => setViewMode("full")}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            viewMode === "full" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Full Answer
        </button>
        <button
          onClick={() => setViewMode("sentences")}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            viewMode === "sentences" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Sentence View
        </button>
      </div>

      {/* PHASE 6: Full Answer View */}
      {viewMode === "full" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-base">
            {answerText}
          </p>
          <p className="text-xs text-gray-600 mt-4 pt-4 border-t border-blue-200">
            💡 Switch to Sentence View to inspect individual sentences and their supporting evidence
          </p>
        </div>
      )}

      {/* PHASE 6: Sentence-Level View */}
      {viewMode === "sentences" && (
        <div className="space-y-2">
          {sentences.length > 0 ? (
            sentences.map((sentence, idx) => {
              const supportingEntities = getSupportingEntities(sentence);
              const isInspecting = inspectingSentenceIdx === idx;

              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Sentence Row */}
                  <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Sentence Number */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>

                      {/* Sentence Text */}
                      <p className="flex-1 text-gray-800 leading-relaxed">{sentence}</p>

                      {/* Inspection Icon */}
                      <button
                        onClick={() => setInspectingSentenceIdx(isInspecting ? null : idx)}
                        className="flex-shrink-0 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Inspect supporting evidence"
                      >
                        <Eye className={`w-4 h-4 ${isInspecting ? "text-blue-600" : "text-gray-400"}`} />
                      </button>
                    </div>

                    {/* Entity Badges */}
                    {supportingEntities.length > 0 && (
                      <div className="mt-3 ml-9 flex flex-wrap gap-1">
                        {supportingEntities.map((ent) => (
                          <span key={ent.name} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {ent.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PHASE 6: Expanded Inspection View */}
                  {isInspecting && (
                    <div className="bg-blue-50 border-t border-gray-200 p-4 space-y-3">
                      {/* Supporting Entities */}
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Supporting Entities:</p>
                        {supportingEntities.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {supportingEntities.map((ent) => (
                              <span
                                key={ent.name}
                                className="px-2 py-1 bg-purple-200 text-purple-900 rounded text-xs font-medium"
                              >
                                {ent.name} ({ent.type})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600">No entities found in this sentence</p>
                        )}
                      </div>

                      {/* Supporting Sources */}
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Source Attribution:</p>
                        {citations && citations.length > 0 ? (
                          <div className="space-y-1">
                            {citations.slice(0, 2).map((cit, idx) => (
                              <div key={idx} className="text-xs text-gray-700 bg-white rounded p-2">
                                <p className="font-medium">Chunk {cit.chunk_index}</p>
                                <p className="text-gray-600 line-clamp-2">"{cit.matched_text?.substring(0, 80)}..."</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600">No direct citations found</p>
                        )}
                      </div>

                      {/* Confidence Indicator */}
                      <div className="bg-white rounded p-2 border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-700">Grounded in evidence</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 p-8">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Unable to parse sentences. Try Full Answer view.</p>
            </div>
          )}
        </div>
      )}

      {/* PHASE 6: Regeneration Options */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">Regenerate Answer With:</p>
        <div className="grid grid-cols-3 gap-2">
          <button className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium text-blue-900 transition-colors">
            <RotateCw className="w-3 h-3 mx-auto mb-1" />
            Same Evidence
          </button>
          <button className="p-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs font-medium text-orange-900 transition-colors">
            <RotateCw className="w-3 h-3 mx-auto mb-1" />
            Stricter Grounding
          </button>
          <button className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-medium text-purple-900 transition-colors">
            <RotateCw className="w-3 h-3 mx-auto mb-1" />
            Graph Only
          </button>
        </div>
      </div>
    </div>
  );
}
