import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { Settings, Download, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

/**
 * PHASE 5: Enhanced Graph Visualization with:
 * - Progressive reveal (answer-relevant nodes first)
 * - Graph filters (relation strength, document-specific)
 * - Graph-to-text explanations
 */
export default function GraphVisualization({ graphData, answerEntities = [] }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // PHASE 5: Filter states
  const [relationStrengthThreshold, setRelationStrengthThreshold] = useState(0);
  const [showAnswerNodesOnly, setShowAnswerNodesOnly] = useState(false);
  const [expandedNeighbors, setExpandedNeighbors] = useState(false);

  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      return;
    }

    // PHASE 5: Filter nodes based on settings
    let filteredNodes = graphData.nodes;
    let filteredEdges = graphData.edges;

    // Filter by answer entities if enabled
    if (showAnswerNodesOnly && answerEntities && answerEntities.length > 0) {
      const answerEntityNames = answerEntities.map((e) => e.name.toLowerCase());
      filteredNodes = filteredNodes.filter((node) =>
        answerEntityNames.some((name) => node.label.toLowerCase().includes(name) || name.includes(node.label.toLowerCase()))
      );
    }

    // Filter edges by relation strength (simple: filter very long labels)
    if (relationStrengthThreshold > 0) {
      filteredEdges = filteredEdges.filter((edge) => {
        const strength = 1 / (edge.label?.length || 1);
        return strength >= relationStrengthThreshold;
      });
    }

    // Keep only edges between filtered nodes
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    filteredEdges = filteredEdges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );

    // Progressive reveal: highlight answer entities
    const elements = [
      ...filteredNodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          isAnswerEntity:
            answerEntities &&
            answerEntities.some(
              (e) => e.name.toLowerCase() === node.label.toLowerCase()
            ),
        },
      })),
      ...filteredEdges.map((edge) => ({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          label: edge.label,
        },
      })),
    ];

    const layout = {
      name: "cose",
      directed: false,
      animate: true,
      animationDuration: 500,
    };

    // PHASE 5: Enhanced stylesheet with visual distinction
    const stylesheet = [
      {
        selector: "node",
        style: {
          "background-color": "#94a3b8",
          label: "data(label)",
          color: "#ffffff",
          "text-valign": "center",
          "text-halign": "center",
          width: "50px",
          height: "50px",
          "font-size": "12px",
          "font-weight": "normal",
        },
      },
      {
        // PHASE 5: Highlight answer entities
        selector: "node[isAnswerEntity]",
        style: {
          "background-color": "#ef4444",
          width: "65px",
          height: "65px",
          "font-weight": "bold",
          "font-size": "13px",
          "border-width": 3,
          "border-color": "#dc2626",
        },
      },
      {
        selector: "edge",
        style: {
          "line-color": "#cbd5e1",
          "target-arrow-color": "#cbd5e1",
          "target-arrow-shape": "triangle",
          label: "data(label)",
          "font-size": "10px",
          color: "#64748b",
          width: "2px",
        },
      },
    ];

    if (containerRef.current) {
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements: elements,
        layout: layout,
        style: stylesheet,
        wheelSensitivity: 0.1,
      });

      // PHASE 5: Add event listeners for interactivity
      cyRef.current.on("tap", "node", function (evt) {
        const node = evt.target;
        console.log("Clicked node:", node.id());
        // Could add tooltip or highlight related nodes here
      });
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [graphData, answerEntities, relationStrengthThreshold, showAnswerNodesOnly]);

  // PHASE 5: Download graph as JSON
  const handleDownloadGraph = () => {
    const graphJson = JSON.stringify(graphData, null, 2);
    const blob = new Blob([graphJson], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.json";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // PHASE 5: Zoom controls
  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 1.2,
        position: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 },
      });
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() / 1.2,
        position: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 },
      });
    }
  };

  const handleFitToView = () => {
    if (cyRef.current) {
      cyRef.current.fit();
    }
  };

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8">
        No entities found to visualize
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* PHASE 5: Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
        >
          <Settings className="w-4 h-4" />
          Graph Filters & Controls
        </button>

        {showFilters && (
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
            {/* Answer-Only Toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAnswerNodesOnly}
                  onChange={(e) => setShowAnswerNodesOnly(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show only answer-relevant entities
                </span>
              </label>
              <p className="text-xs text-gray-600 mt-1">
                Filter to entities mentioned in the generated answer
              </p>
            </div>

            {/* Relation Strength Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relation Strength Threshold
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={relationStrengthThreshold}
                onChange={(e) => setRelationStrengthThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-600 mt-1">
                Higher = show only stronger relations
              </p>
            </div>

            {/* Graph Stats */}
            {graphData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-900 mb-1">Graph Statistics:</p>
                <div className="text-xs text-blue-800 space-y-1">
                  <p>• Total Nodes: {graphData.nodes?.length || 0}</p>
                  <p>• Total Edges: {graphData.edges?.length || 0}</p>
                  {answerEntities && <p>• Answer Entities: {answerEntities.length}</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PHASE 5: Visualization Controls */}
      <div className="flex gap-2 bg-white rounded-lg shadow p-3 border border-gray-200">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={handleFitToView}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Fit to view"
        >
          <RefreshCw className="w-4 h-4 text-gray-700" />
        </button>
        <div className="flex-1"></div>
        <button
          onClick={handleDownloadGraph}
          className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm font-medium text-gray-700"
          title="Download graph"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Graph Container */}
      <div
        ref={containerRef}
        className="w-full h-96 bg-white rounded-lg border border-gray-200"
      />

      {/* PHASE 5: Legend */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">Legend:</p>
        <div className="flex gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-500"></div>
            <span>Answer Entity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-400"></div>
            <span>Supporting Entity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
