import React, { useState } from "react";
import { Search, ExternalLink, Copy, Download, Lightbulb } from "lucide-react";
import api from "../services/api";

export default function EntityExplorer({ entities, sessionId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entityContext, setEntityContext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  const filteredEntities = entities.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEntityClick = async (entity) => {
    setSelectedEntity(entity);
    setLoading(true);

    try {
      const response = await api.post(`/entity-context/${sessionId}`, {}, {
        params: { entity_name: entity.name }
      });
      setEntityContext(response.data);
    } catch (err) {
      console.error("Error fetching entity context:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback("Copied!");
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const getEntityColor = (type) => {
    const colors = {
      PERSON: "bg-red-100 text-red-800 border-red-300",
      ORG: "bg-blue-100 text-blue-800 border-blue-300",
      GPE: "bg-green-100 text-green-800 border-green-300",
      LOC: "bg-yellow-100 text-yellow-800 border-yellow-300",
      DATE: "bg-purple-100 text-purple-800 border-purple-300",
      UNKNOWN: "bg-gray-100 text-gray-800 border-gray-300"
    };
    return colors[type] || colors.UNKNOWN;
  };

  const entityTypeDescriptions = {
    PERSON: "👤 Person - A human individual",
    ORG: "🏢 Organization - A company or institution",
    GPE: "🌍 Geopolitical - Country, city, or state",
    LOC: "📍 Location - A place name",
    DATE: "📅 Date - A temporal expression",
    UNKNOWN: "❓ Unknown - Unclassified entity"
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search entities by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Found {filteredEntities.length} of {entities.length} entities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entities List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-600 text-white p-4 font-semibold">
            🏷️ Entities ({filteredEntities.length})
          </div>
          <div className="overflow-y-auto max-h-96 divide-y">
            {filteredEntities.length > 0 ? (
              filteredEntities.map((entity, idx) => (
                <div
                  key={idx}
                  onClick={() => handleEntityClick(entity)}
                  className={`p-3 cursor-pointer hover:bg-blue-50 transition-all ${
                    selectedEntity?.name === entity.name ? "bg-blue-100" : ""
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{entity.name}</div>
                  <div className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold border ${getEntityColor(entity.type)}`}>
                    {entity.type}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No entities found matching your search
              </div>
            )}
          </div>
        </div>

        {/* Entity Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          {selectedEntity ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {selectedEntity.name}
                  <button
                    onClick={() => handleCopy(selectedEntity.name)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copy entity name"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </h3>
                <div className={`inline-block px-3 py-1 rounded-full font-semibold border ${getEntityColor(selectedEntity.type)}`}>
                  {entityTypeDescriptions[selectedEntity.type] || selectedEntity.type}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4 space-y-2">
                <div className="font-semibold text-gray-900 mb-3">💡 What you can do:</div>
                <button className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Search in Wikipedia
                </button>
                <button
                  onClick={() => handleCopy(selectedEntity.name)}
                  className="w-full bg-green-50 hover:bg-green-100 border border-green-300 text-green-900 py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copyFeedback || "Copy Name"}
                </button>
                <button className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export as CSV
                </button>
              </div>

              {/* Related Content */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">📚 Where it appears:</h4>
                {loading ? (
                  <div className="text-center text-gray-600">Loading context...</div>
                ) : entityContext && entityContext.related_chunks ? (
                  <div className="space-y-3">
                    {entityContext.related_chunks.map((chunk, idx) => (
                      <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                        <div className="font-semibold text-gray-900 mb-1">
                          📄 {chunk.filename}
                        </div>
                        <div className="text-gray-700 line-clamp-3">
                          {chunk.snippet.substring(0, 200)}...
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          ✓ Mentioned {entityContext.total_mentions} time(s)
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600 text-sm">No context found</div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <Lightbulb className="w-12 h-12 mb-3 text-gray-400" />
              <p className="text-center">
                Select an entity from the list to see details and available actions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
