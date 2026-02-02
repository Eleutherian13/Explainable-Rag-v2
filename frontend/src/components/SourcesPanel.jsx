import React, { useState, useMemo, useCallback } from "react";
import {
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  Highlighter,
  Copy,
  ExternalLink,
  Filter,
  Hash,
  Tag,
  Sparkles,
  X,
} from "lucide-react";
import { Button, IconButton } from "./ui/Button";
import { Badge, EntityBadge } from "./ui/Badge";
import { Card, CardHeader, CardContent } from "./ui/Card";
import { EmptyState, ProgressBar, Tooltip } from "./ui/Common";

/**
 * Completely redesigned Sources Panel
 * Features:
 * - Clean, readable source display
 * - Document preview with source highlighting
 * - Toggle between snippet view and full document view
 * - Entity highlighting in sources
 * - Relevance scoring visualization
 */
export default function SourcesPanel({
  snippets = [],
  entities = [],
  answer = "",
  chunkReferences = [],
  citations = [],
  fullDocuments = [], // Full document text for preview
  onEntityClick,
  onGraphFocus,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSource, setExpandedSource] = useState(null);
  const [showCitedOnly, setShowCitedOnly] = useState(false);
  const [viewMode, setViewMode] = useState("snippets"); // "snippets" or "document"
  const [highlightEntities, setHighlightEntities] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Group snippets by document
  const documentGroups = useMemo(() => {
    const groups = {};
    snippets.forEach((snippet, idx) => {
      const ref = chunkReferences.find((r) => r.index === idx);
      const filename = ref?.filename || "Unknown Document";
      if (!groups[filename]) {
        groups[filename] = {
          filename,
          chunks: [],
          totalRelevance: 0,
        };
      }
      groups[filename].chunks.push({
        text: snippet,
        index: idx,
        relevanceScore: ref?.relevance_score || 0,
        isCited: citations.some((c) => c.chunk_index === idx),
      });
      groups[filename].totalRelevance += ref?.relevance_score || 0;
    });

    // Sort by total relevance
    return Object.values(groups).sort(
      (a, b) => b.totalRelevance - a.totalRelevance,
    );
  }, [snippets, chunkReferences, citations]);

  // Find entities in text
  const findEntitiesInText = useCallback(
    (text) => {
      if (!entities || !text) return [];
      const textLower = text.toLowerCase();
      return entities.filter((e) =>
        textLower.includes(e.name?.toLowerCase() || ""),
      );
    },
    [entities],
  );

  // Check if text is used in answer
  const isUsedInAnswer = useCallback(
    (text) => {
      if (!answer || !text) return false;
      const textLower = text.toLowerCase();
      const words = textLower.split(/\s+/).filter((w) => w.length > 4);
      if (words.length === 0) return false;
      const answerLower = answer.toLowerCase();
      const matchCount = words.filter((w) => answerLower.includes(w)).length;
      return matchCount >= Math.min(3, words.length * 0.3);
    },
    [answer],
  );

  // Highlight entities and answer-used text
  const renderHighlightedText = useCallback(
    (text, textEntities = []) => {
      if (!highlightEntities || textEntities.length === 0) {
        return <span>{text}</span>;
      }

      // Sort entities by length (longest first) to avoid partial matches
      const sortedEntities = [...textEntities].sort(
        (a, b) => (b.name?.length || 0) - (a.name?.length || 0),
      );

      // Create a map of positions to highlight
      let result = text;
      const highlights = [];

      sortedEntities.forEach((entity) => {
        if (!entity.name) return;
        const regex = new RegExp(
          `\\b${entity.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "gi",
        );
        let match;
        while ((match = regex.exec(text)) !== null) {
          highlights.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
            type: entity.type,
          });
        }
      });

      // Remove overlapping highlights
      highlights.sort((a, b) => a.start - b.start);
      const filteredHighlights = [];
      let lastEnd = 0;
      highlights.forEach((h) => {
        if (h.start >= lastEnd) {
          filteredHighlights.push(h);
          lastEnd = h.end;
        }
      });

      if (filteredHighlights.length === 0) {
        return <span>{text}</span>;
      }

      // Build result with highlighted spans
      const parts = [];
      let currentPos = 0;

      filteredHighlights.forEach((h, idx) => {
        if (h.start > currentPos) {
          parts.push(
            <span key={`text-${idx}`}>{text.slice(currentPos, h.start)}</span>,
          );
        }
        parts.push(
          <mark
            key={`entity-${idx}`}
            className={`
              px-1 py-0.5 rounded text-sm font-medium cursor-pointer
              ${
                h.type === "PERSON"
                  ? "bg-blue-100 text-blue-800"
                  : h.type === "ORG" || h.type === "ORGANIZATION"
                    ? "bg-green-100 text-green-800"
                    : h.type === "LOCATION" || h.type === "GPE"
                      ? "bg-amber-100 text-amber-800"
                      : h.type === "DATE" || h.type === "TIME"
                        ? "bg-pink-100 text-pink-800"
                        : h.type === "TECHNOLOGY"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
              }
            `}
            onClick={() => onEntityClick?.(h.text)}
            title={`${h.type}: Click to explore`}
          >
            {h.text}
          </mark>,
        );
        currentPos = h.end;
      });

      if (currentPos < text.length) {
        parts.push(<span key="text-end">{text.slice(currentPos)}</span>);
      }

      return <>{parts}</>;
    },
    [highlightEntities, onEntityClick],
  );

  // Copy text to clipboard
  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Filter snippets
  const filteredGroups = useMemo(() => {
    return documentGroups
      .map((group) => ({
        ...group,
        chunks: group.chunks.filter((chunk) => {
          if (showCitedOnly && !chunk.isCited) return false;
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return chunk.text.toLowerCase().includes(term);
          }
          return true;
        }),
      }))
      .filter((group) => group.chunks.length > 0);
  }, [documentGroups, showCitedOnly, searchTerm]);

  // Total stats
  const stats = useMemo(() => {
    const totalChunks = snippets.length;
    const citedChunks = citations.length;
    const uniqueDocs = new Set(chunkReferences.map((r) => r.filename)).size;
    const totalEntities = entities.length;
    return { totalChunks, citedChunks, uniqueDocs, totalEntities };
  }, [snippets, citations, chunkReferences, entities]);

  if (snippets.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Sources Available"
        description="Upload documents and submit a query to see source evidence."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">Source Evidence</h2>
            <p className="text-emerald-100 text-sm">
              Retrieved passages supporting the answer
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.totalChunks}</p>
            <p className="text-xs text-emerald-100">Retrieved Chunks</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.citedChunks}</p>
            <p className="text-xs text-emerald-100">Cited in Answer</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.uniqueDocs}</p>
            <p className="text-xs text-emerald-100">Documents</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.totalEntities}</p>
            <p className="text-xs text-emerald-100">Entities Found</p>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search in sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={showCitedOnly ? "primary" : "secondary"}
              size="sm"
              icon={showCitedOnly ? CheckCircle : Filter}
              onClick={() => setShowCitedOnly(!showCitedOnly)}
            >
              {showCitedOnly ? "Cited Only" : "All Sources"}
            </Button>

            <Button
              variant={highlightEntities ? "primary" : "secondary"}
              size="sm"
              icon={Highlighter}
              onClick={() => setHighlightEntities(!highlightEntities)}
            >
              Entities
            </Button>
          </div>
        </div>
      </Card>

      {/* Document Groups */}
      <div className="space-y-4">
        {filteredGroups.map((group) => (
          <Card key={group.filename} className="overflow-hidden">
            {/* Document Header */}
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {group.filename}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {group.chunks.length} passage
                      {group.chunks.length !== 1 ? "s" : ""} retrieved
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">
                    {Math.round(
                      (group.totalRelevance / group.chunks.length) * 100,
                    )}
                    % avg relevance
                  </Badge>
                </div>
              </div>
            </div>

            {/* Chunks */}
            <div className="divide-y divide-gray-100">
              {group.chunks.map((chunk, chunkIdx) => {
                const isExpanded =
                  expandedSource === `${group.filename}-${chunk.index}`;
                const chunkEntities = findEntitiesInText(chunk.text);
                const isUsed = isUsedInAnswer(chunk.text);

                return (
                  <div
                    key={chunk.index}
                    className={`
                      transition-all duration-200
                      ${isUsed ? "bg-emerald-50/50" : ""}
                      ${isExpanded ? "bg-blue-50/30" : "hover:bg-gray-50"}
                    `}
                  >
                    {/* Chunk Header */}
                    <button
                      onClick={() =>
                        setExpandedSource(
                          isExpanded
                            ? null
                            : `${group.filename}-${chunk.index}`,
                        )
                      }
                      className="w-full px-5 py-4 text-left"
                    >
                      <div className="flex items-start gap-4">
                        {/* Chunk Number & Relevance */}
                        <div className="flex-shrink-0 text-center">
                          <div
                            className={`
                              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                              ${
                                chunk.isCited
                                  ? "bg-emerald-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }
                            `}
                          >
                            {chunkIdx + 1}
                          </div>
                          <div className="mt-1">
                            <ProgressBar
                              value={chunk.relevanceScore * 100}
                              variant={
                                chunk.relevanceScore > 0.7
                                  ? "success"
                                  : chunk.relevanceScore > 0.4
                                    ? "warning"
                                    : "danger"
                              }
                              size="sm"
                            />
                            <p className="text-xs text-gray-500 mt-0.5">
                              {Math.round(chunk.relevanceScore * 100)}%
                            </p>
                          </div>
                        </div>

                        {/* Content Preview */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {chunk.isCited && (
                              <Badge variant="success" size="xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Cited
                              </Badge>
                            )}
                            {isUsed && !chunk.isCited && (
                              <Badge variant="info" size="xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Used in Answer
                              </Badge>
                            )}
                            {chunkEntities.length > 0 && (
                              <Badge variant="purple" size="xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {chunkEntities.length} entities
                              </Badge>
                            )}
                          </div>

                          <p
                            className={`
                              text-gray-700 leading-relaxed
                              ${isExpanded ? "" : "line-clamp-3"}
                            `}
                          >
                            {isExpanded
                              ? renderHighlightedText(chunk.text, chunkEntities)
                              : chunk.text.slice(0, 200) +
                                (chunk.text.length > 200 ? "..." : "")}
                          </p>
                        </div>

                        {/* Expand Icon */}
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-5 pb-4 animate-slideDown">
                        <div className="ml-14 space-y-4">
                          {/* Full Text with Highlighting */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Full Passage
                              </h4>
                              <Button
                                variant="ghost"
                                size="xs"
                                icon={
                                  copiedIndex === chunk.index
                                    ? CheckCircle
                                    : Copy
                                }
                                onClick={() =>
                                  handleCopy(chunk.text, chunk.index)
                                }
                              >
                                {copiedIndex === chunk.index
                                  ? "Copied!"
                                  : "Copy"}
                              </Button>
                            </div>
                            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {renderHighlightedText(chunk.text, chunkEntities)}
                            </div>
                          </div>

                          {/* Entities in this chunk */}
                          {chunkEntities.length > 0 && (
                            <div className="bg-purple-50 rounded-lg p-4">
                              <h4 className="font-medium text-purple-800 mb-3 flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Entities in this passage ({chunkEntities.length}
                                )
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {chunkEntities.map((entity, eIdx) => (
                                  <button
                                    key={eIdx}
                                    onClick={() => onEntityClick?.(entity.name)}
                                    className={`
                                      px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                                      ${
                                        entity.type === "PERSON"
                                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                          : entity.type === "ORG" ||
                                              entity.type === "ORGANIZATION"
                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                            : entity.type === "LOCATION" ||
                                                entity.type === "GPE"
                                              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      }
                                    `}
                                  >
                                    {entity.name}
                                    <span className="ml-1 opacity-60">
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
                              onClick={() =>
                                onGraphFocus?.({ name: group.filename })
                              }
                            >
                              View in Graph
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredGroups.length === 0 && (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No matching sources
          </h3>
          <p className="text-gray-500">
            {showCitedOnly
              ? "No cited sources match your search. Try showing all sources."
              : "Try adjusting your search term."}
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchTerm("");
              setShowCitedOnly(false);
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-700 mb-3">Entity Color Legend</h4>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-blue-100"></span>
            <span className="text-sm text-gray-600">Person</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-100"></span>
            <span className="text-sm text-gray-600">Organization</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-amber-100"></span>
            <span className="text-sm text-gray-600">Location</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-pink-100"></span>
            <span className="text-sm text-gray-600">Date/Time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-purple-100"></span>
            <span className="text-sm text-gray-600">Technology</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
