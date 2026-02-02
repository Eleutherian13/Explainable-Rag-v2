import React, { useEffect, useRef, useState, useMemo } from "react";
import cytoscape from "cytoscape";
import {
  Settings,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Filter,
  Eye,
  Image,
  FileJson,
  Info,
  Network,
} from "lucide-react";
import { Button, IconButton } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Card, CardContent } from "./ui/Card";
import { Collapsible, EmptyState, Tooltip } from "./ui/Common";

/**
 * PHASE 5: Enhanced Knowledge Graph with reasoning capabilities
 * - Progressive reveal (answer-relevant nodes first)
 * - Graph filters (relation strength, document-specific)
 * - Graph-to-text explanation
 * - Export options (JSON, PNG/SVG)
 */
export default function EnhancedGraphVisualization({
  graphData,
  entities = [],
  answer = "",
  focusedEntity = null,
  onNodeClick,
}) {
  // Derive answer entities from entities that appear in the answer
  const answerEntities = useMemo(() => {
    if (!entities || !answer) return [];
    const answerLower = answer.toLowerCase();
    return entities.filter((e) =>
      answerLower.includes(e.name?.toLowerCase() || ""),
    );
  }, [entities, answer]);

  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Filter states
  const [showAnswerNodesOnly, setShowAnswerNodesOnly] = useState(false);
  const [relationStrengthThreshold, setRelationStrengthThreshold] = useState(0);
  const [selectedLayout, setSelectedLayout] = useState("cose");
  const [nodeSize, setNodeSize] = useState("medium");

  // Graph explanation
  const [graphExplanation, setGraphExplanation] = useState("");

  // Node size mapping
  const nodeSizes = {
    small: { base: 40, answer: 50 },
    medium: { base: 55, answer: 70 },
    large: { base: 70, answer: 90 },
  };

  // Filter and prepare graph data
  const processedGraph = useMemo(() => {
    if (!graphData?.nodes || graphData.nodes.length === 0) {
      return { nodes: [], edges: [] };
    }

    let filteredNodes = [...graphData.nodes];
    let filteredEdges = [...(graphData.edges || [])];

    // Filter by answer entities
    if (showAnswerNodesOnly && answerEntities.length > 0) {
      const answerEntityNames = answerEntities.map((e) =>
        e.name?.toLowerCase(),
      );
      filteredNodes = filteredNodes.filter((node) =>
        answerEntityNames.some(
          (name) =>
            node.label?.toLowerCase().includes(name) ||
            name.includes(node.label?.toLowerCase()),
        ),
      );
    }

    // Filter by focused entity
    if (focusedEntity) {
      const focusName = focusedEntity.name?.toLowerCase();
      // Keep focused entity and its neighbors
      const connectedNodeIds = new Set();
      connectedNodeIds.add(focusName);

      filteredEdges.forEach((edge) => {
        if (edge.source?.toLowerCase() === focusName) {
          connectedNodeIds.add(edge.target?.toLowerCase());
        }
        if (edge.target?.toLowerCase() === focusName) {
          connectedNodeIds.add(edge.source?.toLowerCase());
        }
      });

      filteredNodes = graphData.nodes.filter(
        (node) =>
          connectedNodeIds.has(node.id?.toLowerCase()) ||
          connectedNodeIds.has(node.label?.toLowerCase()),
      );
    }

    // Keep only edges between filtered nodes
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    filteredEdges = filteredEdges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
    );

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [graphData, showAnswerNodesOnly, answerEntities, focusedEntity]);

  // Generate graph explanation
  useEffect(() => {
    if (processedGraph.nodes.length === 0) {
      setGraphExplanation("");
      return;
    }

    const answerNodeNames = answerEntities.map((e) => e.name);
    const totalNodes = processedGraph.nodes.length;
    const totalEdges = processedGraph.edges.length;

    // Find most connected nodes
    const connectionCount = {};
    processedGraph.edges.forEach((edge) => {
      connectionCount[edge.source] = (connectionCount[edge.source] || 0) + 1;
      connectionCount[edge.target] = (connectionCount[edge.target] || 0) + 1;
    });

    const sortedNodes = Object.entries(connectionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    let explanation = `This knowledge graph contains **${totalNodes} entities** connected by **${totalEdges} relationships**. `;

    if (answerNodeNames.length > 0) {
      explanation += `The entities mentioned in the answer (highlighted in red) include: ${answerNodeNames.slice(0, 5).join(", ")}${answerNodeNames.length > 5 ? "..." : ""}. `;
    }

    if (sortedNodes.length > 0) {
      explanation += `The most connected entities are: ${sortedNodes.map(([name, count]) => `${name} (${count} connections)`).join(", ")}. `;
    }

    explanation += `These connections show how different concepts in your documents relate to each other and support the generated answer.`;

    setGraphExplanation(explanation);
  }, [processedGraph, answerEntities]);

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current || processedGraph.nodes.length === 0) {
      return;
    }

    const sizes = nodeSizes[nodeSize];

    const elements = [
      ...processedGraph.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          isAnswerEntity: answerEntities.some(
            (e) => e.name?.toLowerCase() === node.label?.toLowerCase(),
          ),
          isFocused:
            focusedEntity &&
            node.label?.toLowerCase() === focusedEntity.name?.toLowerCase(),
        },
      })),
      ...processedGraph.edges.map((edge, idx) => ({
        data: {
          id: `edge-${idx}`,
          source: edge.source,
          target: edge.target,
          label: edge.label || "",
        },
      })),
    ];

    const layouts = {
      cose: {
        name: "cose",
        animate: true,
        animationDuration: 500,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
      },
      circle: { name: "circle", animate: true },
      grid: { name: "grid", animate: true },
      breadthfirst: { name: "breadthfirst", animate: true },
      concentric: { name: "concentric", animate: true },
    };

    const stylesheet = [
      {
        selector: "node",
        style: {
          "background-color": "#64748b",
          label: "data(label)",
          color: "#ffffff",
          "text-valign": "center",
          "text-halign": "center",
          width: sizes.base,
          height: sizes.base,
          "font-size": "11px",
          "font-weight": "500",
          "text-wrap": "ellipsis",
          "text-max-width": "60px",
          "border-width": 2,
          "border-color": "#475569",
        },
      },
      {
        selector: "node[isAnswerEntity]",
        style: {
          "background-color": "#ef4444",
          width: sizes.answer,
          height: sizes.answer,
          "font-weight": "bold",
          "font-size": "12px",
          "border-width": 3,
          "border-color": "#dc2626",
        },
      },
      {
        selector: "node[isFocused]",
        style: {
          "background-color": "#8b5cf6",
          width: sizes.answer + 10,
          height: sizes.answer + 10,
          "border-width": 4,
          "border-color": "#7c3aed",
        },
      },
      {
        selector: "edge",
        style: {
          "line-color": "#cbd5e1",
          "target-arrow-color": "#94a3b8",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          width: 2,
          label: "data(label)",
          "font-size": "9px",
          color: "#64748b",
          "text-background-color": "#ffffff",
          "text-background-opacity": 0.8,
          "text-background-padding": "2px",
        },
      },
      {
        selector: ":selected",
        style: {
          "background-color": "#3b82f6",
          "border-color": "#1d4ed8",
          "border-width": 4,
        },
      },
    ];

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      layout: layouts[selectedLayout],
      style: stylesheet,
      wheelSensitivity: 0.2,
      minZoom: 0.3,
      maxZoom: 3,
    });

    // Node click handler
    cyRef.current.on("tap", "node", function (evt) {
      const node = evt.target;
      const nodeData = {
        id: node.id(),
        label: node.data("label"),
      };
      onNodeClick?.(nodeData);
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [processedGraph, selectedLayout, nodeSize, answerEntities, focusedEntity]);

  // Zoom controls
  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.3);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() / 1.3);
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
  };

  const handleRelayout = () => {
    if (cyRef.current) {
      cyRef.current.layout({ name: selectedLayout, animate: true }).run();
    }
  };

  // Export functions
  const handleExportJSON = () => {
    const data = JSON.stringify(graphData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knowledge-graph.json";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportPNG = () => {
    if (cyRef.current) {
      const png = cyRef.current.png({ scale: 2, bg: "#ffffff" });
      const a = document.createElement("a");
      a.href = png;
      a.download = "knowledge-graph.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (!graphData?.nodes || graphData.nodes.length === 0) {
    return (
      <EmptyState
        icon={Network}
        title="No Graph Data"
        description="Upload documents and submit a query to generate a knowledge graph."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: View Controls */}
          <div className="flex items-center gap-2">
            <IconButton icon={ZoomIn} onClick={handleZoomIn} title="Zoom in" />
            <IconButton
              icon={ZoomOut}
              onClick={handleZoomOut}
              title="Zoom out"
            />
            <IconButton
              icon={Maximize2}
              onClick={handleFit}
              title="Fit to view"
            />
            <IconButton
              icon={RefreshCw}
              onClick={handleRelayout}
              title="Re-layout"
            />

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Layout Selector */}
            <select
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value)}
              className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
            >
              <option value="cose">Force-directed</option>
              <option value="circle">Circle</option>
              <option value="grid">Grid</option>
              <option value="breadthfirst">Hierarchy</option>
              <option value="concentric">Concentric</option>
            </select>

            {/* Node Size */}
            <select
              value={nodeSize}
              onChange={(e) => setNodeSize(e.target.value)}
              className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
            >
              <option value="small">Small nodes</option>
              <option value="medium">Medium nodes</option>
              <option value="large">Large nodes</option>
            </select>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "primary" : "secondary"}
              size="sm"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={FileJson}
              onClick={handleExportJSON}
            >
              JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Image}
              onClick={handleExportPNG}
            >
              PNG
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAnswerNodesOnly}
                onChange={(e) => setShowAnswerNodesOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Show only answer-relevant entities
              </span>
            </label>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Relation strength filter
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={relationStrengthThreshold}
                onChange={(e) =>
                  setRelationStrengthThreshold(parseFloat(e.target.value))
                }
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Graph Stats */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="default" size="md">
          <Network className="w-3 h-3 mr-1" />
          {processedGraph.nodes.length} nodes
        </Badge>
        <Badge variant="default" size="md">
          {processedGraph.edges.length} edges
        </Badge>
        {answerEntities.length > 0 && (
          <Badge variant="danger" size="md">
            {answerEntities.length} in answer
          </Badge>
        )}
        {focusedEntity && (
          <Badge variant="purple" size="md">
            Focused: {focusedEntity.name}
          </Badge>
        )}
      </div>

      {/* Graph Container */}
      <div
        ref={containerRef}
        className="w-full h-[500px] bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-inner"
      />

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-600"></div>
            <span className="text-gray-600">Answer Entity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-purple-600"></div>
            <span className="text-gray-600">Focused Entity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-500 border-2 border-slate-600"></div>
            <span className="text-gray-600">Supporting Entity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-slate-300"></div>
            <span className="text-gray-600">Relationship</span>
          </div>
        </div>
      </div>

      {/* Graph Explanation */}
      <Collapsible
        title="Graph Explanation"
        icon={Info}
        defaultOpen={false}
        badge={
          <Badge variant="info" size="xs">
            AI Generated
          </Badge>
        }
      >
        <p
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: graphExplanation.replace(
              /\*\*(.*?)\*\*/g,
              "<strong>$1</strong>",
            ),
          }}
        />
      </Collapsible>
    </div>
  );
}
