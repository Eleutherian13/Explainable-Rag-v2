import React, { useState, useMemo } from "react";
import {
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Link2,
  Sparkles,
  Eye,
  BookOpen,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Card, CardContent } from "./ui/Card";
import { ProgressBar, EmptyState, Tooltip } from "./ui/Common";

/**
 * PHASE 3: Enhanced Sources Panel with evidence-centric design
 * - Sentence-level segmentation
 * - Highlight detected entities
 * - Badge sentences used in answer
 * - Bidirectional linking to entities and graph
 */
export default function EnhancedSourcesPanel({
  snippets = [],
  citations = [],
  entities = [],
  answer = "",
  chunkReferences = [],
  onEntityClick,
  onGraphFocus,
  highlightedChunk = null,
  highlightEntity = null, // Entity name to highlight
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedChunk, setExpandedChunk] = useState(null);
  const [showCitedOnly, setShowCitedOnly] = useState(false);

  // Get cited chunk indices
  const citedChunkIndices = useMemo(() => {
    return new Set(citations.map((c) => c.chunk_index));
  }, [citations]);

  // Parse snippets with metadata
  const enrichedSnippets = useMemo(() => {
    return snippets.map((snippet, idx) => {
      const isCited = citedChunkIndices.has(idx);
      const relevanceScore =
        chunkReferences.find((r) => r.index === idx)?.relevance_score || 0;
      const citation = citations.find((c) => c.chunk_index === idx);

      // Split into sentences
      const sentenceRegex = /[^.!?]*[.!?]+(?:\s|$)/g;
      const sentences = snippet.match(sentenceRegex) || [snippet];

      // Find entities in this snippet
      const snippetEntities = entities.filter((e) =>
        snippet.toLowerCase().includes(e.name?.toLowerCase() || ""),
      );

      // Check if each sentence is used in answer
      const sentencesWithMeta = sentences.map((sentence) => {
        const sentenceLower = sentence.toLowerCase().trim();
        const isInAnswer = answer
          .toLowerCase()
          .split(/[.!?]+/)
          .some((answerSentence) => {
            const words = sentenceLower
              .split(/\s+/)
              .filter((w) => w.length > 4);
            const matchCount = words.filter((w) =>
              answerSentence.includes(w),
            ).length;
            return matchCount >= Math.min(3, words.length / 2);
          });

        const sentenceEntities = entities.filter((e) =>
          sentence.toLowerCase().includes(e.name?.toLowerCase() || ""),
        );

        return {
          text: sentence.trim(),
          isInAnswer,
          entities: sentenceEntities,
        };
      });

      return {
        text: snippet,
        index: idx,
        isCited,
        relevanceScore,
        citation,
        sentences: sentencesWithMeta,
        entities: snippetEntities,
        filename:
          chunkReferences.find((r) => r.index === idx)?.filename || "Document",
      };
    });
  }, [
    snippets,
    citations,
    entities,
    answer,
    chunkReferences,
    citedChunkIndices,
  ]);

  // Filter snippets
  const filteredSnippets = useMemo(() => {
    let filtered = [...enrichedSnippets];

    if (showCitedOnly) {
      filtered = filtered.filter((s) => s.isCited);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.text.toLowerCase().includes(term) ||
          s.entities.some((e) => e.name?.toLowerCase().includes(term)),
      );
    }

    return filtered;
  }, [enrichedSnippets, showCitedOnly, searchTerm]);

  // Highlight entity in text
  const highlightEntities = (text, entitiesToHighlight) => {
    if (!entitiesToHighlight || entitiesToHighlight.length === 0) {
      return text;
    }

    let result = text;
    const sortedEntities = [...entitiesToHighlight].sort(
      (a, b) => (b.name?.length || 0) - (a.name?.length || 0),
    );

    sortedEntities.forEach((entity) => {
      if (entity.name) {
        const regex = new RegExp(
          `(${entity.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
          "gi",
        );
        result = result.replace(
          regex,
          `<mark class="bg-purple-100 text-purple-800 px-0.5 rounded">$1</mark>`,
        );
      }
    });

    return result;
  };

  if (snippets.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Source Documents"
        description="Upload documents and submit a query to see source evidence."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search in sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Cited Only Toggle */}
          <Button
            variant={showCitedOnly ? "primary" : "secondary"}
            size="sm"
            icon={showCitedOnly ? CheckCircle : BookOpen}
            onClick={() => setShowCitedOnly(!showCitedOnly)}
          >
            {showCitedOnly ? "Cited Sources" : "All Sources"}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-3 text-sm text-gray-600">
          <span>
            <strong>{filteredSnippets.length}</strong> of {snippets.length}{" "}
            chunks
          </span>
          <span className="text-emerald-600">
            <strong>{citedChunkIndices.size}</strong> cited in answer
          </span>
        </div>
      </div>

      {/* Source Chunks */}
      <div className="space-y-3">
        {filteredSnippets.map((chunk) => {
          const isExpanded = expandedChunk === chunk.index;
          const isHighlighted = highlightedChunk === chunk.index;

          return (
            <Card
              key={chunk.index}
              className={`
                transition-all duration-200
                ${isHighlighted ? "ring-2 ring-blue-500 shadow-lg" : ""}
                ${chunk.isCited ? "border-l-4 border-l-emerald-500" : ""}
              `}
            >
              {/* Chunk Header */}
              <button
                className="w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpandedChunk(isExpanded ? null : chunk.index)
                }
              >
                {/* Chunk Index */}
                <div
                  className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
                    ${chunk.isCited ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}
                  `}
                >
                  #{chunk.index}
                </div>

                {/* Chunk Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-medium">
                      {chunk.filename}
                    </span>
                    {chunk.isCited && (
                      <Badge variant="success" size="xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Cited
                      </Badge>
                    )}
                    {chunk.entities.length > 0 && (
                      <Badge variant="purple" size="xs">
                        {chunk.entities.length} entities
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {chunk.text.slice(0, 200)}...
                  </p>
                </div>

                {/* Relevance Score */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <div className="w-16">
                    <ProgressBar
                      value={chunk.relevanceScore * 100}
                      variant={
                        chunk.relevanceScore > 0.7 ? "success" : "primary"
                      }
                      size="sm"
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(chunk.relevanceScore * 100)}%
                  </span>
                </div>

                {/* Expand Icon */}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="bg-gray-50 border-t border-gray-100 animate-slideDown">
                  {/* Sentence-level breakdown */}
                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Sentence Analysis
                    </h4>
                    <div className="space-y-1">
                      {chunk.sentences.map((sentence, sIdx) => (
                        <div
                          key={sIdx}
                          className={`
                            p-2 rounded text-sm flex items-start gap-2
                            ${sentence.isInAnswer ? "bg-emerald-50 border border-emerald-200" : "bg-white border border-gray-100"}
                          `}
                        >
                          {sentence.isInAnswer ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-4 h-4 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p
                              className="text-gray-700"
                              dangerouslySetInnerHTML={{
                                __html: highlightEntities(
                                  sentence.text,
                                  sentence.entities,
                                ),
                              }}
                            />
                            {sentence.entities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sentence.entities.map((e, eIdx) => (
                                  <button
                                    key={eIdx}
                                    onClick={() => onEntityClick?.(e)}
                                    className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                                  >
                                    {e.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {sentence.isInAnswer && (
                            <Tooltip text="This sentence supports the answer">
                              <Badge variant="success" size="xs">
                                Evidence
                              </Badge>
                            </Tooltip>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Entity Links */}
                  {chunk.entities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Entities in this chunk
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {chunk.entities.map((entity, idx) => (
                          <button
                            key={idx}
                            onClick={() => onEntityClick?.(entity)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition-colors"
                          >
                            <Link2 className="w-3 h-3" />
                            {entity.name}
                            <span className="text-purple-400 text-xs">
                              ({entity.type})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      onClick={() => onGraphFocus?.(chunk.entities)}
                    >
                      Focus on Graph
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty filtered state */}
      {filteredSnippets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No sources match your filters</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setShowCitedOnly(false);
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
