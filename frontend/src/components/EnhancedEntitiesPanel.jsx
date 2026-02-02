import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  FileText,
  Network,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Button, IconButton } from "./ui/Button";
import { Badge, EntityBadge } from "./ui/Badge";
import { Card, CardHeader, CardContent } from "./ui/Card";
import { EmptyState, Tooltip } from "./ui/Common";

/**
 * PHASE 4: Enhanced Entities Panel with actionable entity controls
 * - Highlight source sentences containing entity
 * - Focus knowledge graph on entity
 * - Regenerate answer with entity focus
 * - Exclude entity (what-if mode)
 */
export default function EnhancedEntitiesPanel({
  entities = [],
  answer = "",
  snippets = [],
  focusedEntity = null,
  onShowSources,
  onFocusGraph,
  onRegenerateWithEntity,
  onExcludeEntity,
  selectedEntity,
}) {
  // Derive answer entities from entities that appear in the answer
  const answerEntities = useMemo(() => {
    if (!entities || !answer) return [];
    const answerLower = answer.toLowerCase();
    return entities.filter((e) =>
      answerLower.includes(e.name?.toLowerCase() || ""),
    );
  }, [entities, answer]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showAnswerOnly, setShowAnswerOnly] = useState(false);
  const [expandedEntity, setExpandedEntity] = useState(null);

  // Get unique entity types
  const entityTypes = useMemo(() => {
    const types = new Set(entities.map((e) => e.type || "UNKNOWN"));
    return ["all", ...Array.from(types).sort()];
  }, [entities]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    let filtered = [...entities];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name?.toLowerCase().includes(term) ||
          e.type?.toLowerCase().includes(term),
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((e) => e.type === filterType);
    }

    // Answer entities only
    if (showAnswerOnly && answerEntities.length > 0) {
      const answerEntityNames = answerEntities.map((e) =>
        e.name?.toLowerCase(),
      );
      filtered = filtered.filter((e) =>
        answerEntityNames.includes(e.name?.toLowerCase()),
      );
    }

    return filtered;
  }, [entities, searchTerm, filterType, showAnswerOnly, answerEntities]);

  // Check if entity is in answer
  const isInAnswer = (entity) => {
    return answerEntities.some(
      (ae) => ae.name?.toLowerCase() === entity.name?.toLowerCase(),
    );
  };

  // Find source snippets containing entity
  const getEntitySources = (entity) => {
    if (!snippets || !entity.name) return [];
    const entityLower = entity.name.toLowerCase();
    return snippets
      .map((snippet, idx) => ({ snippet, idx }))
      .filter(({ snippet }) => snippet.toLowerCase().includes(entityLower));
  };

  // Type color mapping
  const getTypeColor = (type) => {
    const colors = {
      PERSON: "purple",
      ORG: "primary",
      GPE: "success",
      LOC: "info",
      DATE: "warning",
      MONEY: "success",
      PRODUCT: "pink",
      EVENT: "danger",
      SKILL: "primary",
      EDUCATION: "info",
    };
    return colors[type?.toUpperCase()] || "default";
  };

  if (entities.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Entities Found"
        description="Upload documents and submit a query to extract entities."
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
              placeholder="Search entities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {entityTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </option>
              ))}
            </select>
          </div>

          {/* Answer Only Toggle */}
          <Button
            variant={showAnswerOnly ? "primary" : "secondary"}
            size="sm"
            icon={showAnswerOnly ? Eye : EyeOff}
            onClick={() => setShowAnswerOnly(!showAnswerOnly)}
          >
            {showAnswerOnly ? "Answer Entities" : "All Entities"}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-3 text-sm text-gray-600">
          <span>
            <strong>{filteredEntities.length}</strong> of {entities.length}{" "}
            entities
          </span>
          {answerEntities.length > 0 && (
            <span className="text-blue-600">
              <strong>{answerEntities.length}</strong> in answer
            </span>
          )}
        </div>
      </div>

      {/* Entity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredEntities.map((entity, idx) => {
          const isExpanded = expandedEntity === idx;
          const isSelected = selectedEntity?.name === entity.name;
          const inAnswer = isInAnswer(entity);
          const sources = getEntitySources(entity);

          return (
            <Card
              key={idx}
              className={`
                transition-all duration-200 cursor-pointer
                ${isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""}
                ${inAnswer ? "border-emerald-200 bg-emerald-50/30" : ""}
              `}
              hover
            >
              <div
                className="p-4"
                onClick={() => {
                  setExpandedEntity(isExpanded ? null : idx);
                }}
              >
                {/* Entity Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">
                      {entity.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getTypeColor(entity.type)} size="xs">
                        {entity.type || "UNKNOWN"}
                      </Badge>
                      {inAnswer && (
                        <Badge variant="success" size="xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          In Answer
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </div>

                {/* Source Count */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText className="w-3 h-3" />
                  <span>Found in {sources.length} source(s)</span>
                </div>

                {/* Expanded Actions */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-slideDown">
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={Eye}
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowSources?.(entity);
                        }}
                        fullWidth
                      >
                        Show Sources
                      </Button>
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={Network}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusGraph?.(entity);
                        }}
                        fullWidth
                      >
                        Focus Graph
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Tooltip text="Regenerate answer focusing on this entity">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={RefreshCw}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRegenerateWithEntity?.(entity);
                          }}
                          fullWidth
                        >
                          Focus Query
                        </Button>
                      </Tooltip>
                      <Tooltip text="What if we exclude this entity?">
                        <Button
                          variant="danger"
                          size="xs"
                          icon={AlertTriangle}
                          onClick={(e) => {
                            e.stopPropagation();
                            onExcludeEntity?.(entity);
                          }}
                          fullWidth
                        >
                          What If?
                        </Button>
                      </Tooltip>
                    </div>

                    {/* Source Preview */}
                    {sources.length > 0 && (
                      <div className="bg-gray-50 rounded p-2 max-h-24 overflow-y-auto">
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          Source Preview:
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-3">
                          ...{sources[0]?.snippet?.slice(0, 150)}...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State for Filtered */}
      {filteredEntities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No entities match your filters</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setFilterType("all");
              setShowAnswerOnly(false);
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
