import React, { useState, useMemo } from "react";
import {
  Copy,
  Download,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Sparkles,
  Bookmark,
  Info,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge, StatusBadge } from "./ui/Badge";
import { Card, CardContent } from "./ui/Card";
import { Collapsible, Tooltip, ProgressBar } from "./ui/Common";

/**
 * PHASE 6: Enhanced Answer Panel with sentence-level inspection
 * - Breaks answer into sentence units
 * - Each sentence has inspection capability
 * - Shows supporting entities, sources, and graph edges
 */
export default function EnhancedAnswerPanel({
  answer,
  query,
  entities = [],
  snippets = [],
  citations = [],
  confidenceScore = 0.5,
  onEntityClick,
  onSourceClick,
}) {
  const confidence = confidenceScore; // Alias for internal use
  const [copied, setCopied] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [showKeyPoints, setShowKeyPoints] = useState(true);

  // Parse answer into sections (main answer, summary, key points)
  const parsedAnswer = useMemo(() => {
    if (!answer) return { main: "", summary: "", keyPoints: [] };

    const lines = answer.split("\n");
    let main = [];
    let summary = "";
    let keyPoints = [];
    let currentSection = "main";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith("summary:")) {
        currentSection = "summary";
        summary = trimmed.replace(/^summary:/i, "").trim();
      } else if (trimmed.toLowerCase().startsWith("key points:")) {
        currentSection = "keyPoints";
      } else if (currentSection === "summary" && trimmed) {
        summary += " " + trimmed;
      } else if (currentSection === "keyPoints" && trimmed.startsWith("-")) {
        keyPoints.push(trimmed.slice(1).trim());
      } else if (currentSection === "main") {
        main.push(line);
      }
    }

    return {
      main: main.join("\n").trim(),
      summary: summary.trim(),
      keyPoints,
    };
  }, [answer]);

  // Split main answer into sentences for inspection
  const sentences = useMemo(() => {
    if (!parsedAnswer.main) return [];
    // Split by sentence-ending punctuation followed by space or newline
    const sentenceRegex = /[^.!?]*[.!?]+(?:\s|$)/g;
    const matches = parsedAnswer.main.match(sentenceRegex) || [];
    return matches.map((s) => s.trim()).filter((s) => s.length > 0);
  }, [parsedAnswer.main]);

  // Find entities mentioned in a sentence
  const getEntitiesInSentence = (sentence) => {
    if (!entities || !sentence) return [];
    const sentenceLower = sentence.toLowerCase();
    return entities.filter((e) =>
      sentenceLower.includes(e.name?.toLowerCase() || ""),
    );
  };

  // Find supporting sources for a sentence
  const getSupportingSourcesForSentence = (sentence) => {
    if (!snippets || !sentence) return [];
    const sentenceLower = sentence.toLowerCase();
    // Find snippets that might support this sentence
    return snippets
      .map((snippet, idx) => ({ snippet, idx }))
      .filter(({ snippet }) => {
        const snippetText = snippet?.toLowerCase() || "";
        const sentenceWords = sentenceLower
          .split(/\s+/)
          .filter((w) => w.length > 4);
        const matchCount = sentenceWords.filter((w) =>
          snippetText.includes(w),
        ).length;
        return matchCount >= Math.min(3, sentenceWords.length / 2);
      });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const content = {
      answer,
      query,
      summary: parsedAnswer.summary,
      keyPoints: parsedAnswer.keyPoints,
      entities,
      sources: snippets,
      confidence,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `answer-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadPDF = () => {
    // Create a formatted HTML for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Answer Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
          h1 { color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 24px; }
          .answer { background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .summary { background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; }
          .key-points { background: #fefce8; padding: 16px; border-radius: 8px; }
          .key-points li { margin: 8px 0; }
          .entities { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
          .entity { background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 16px; font-size: 14px; }
          .confidence { color: #059669; font-weight: bold; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>📄 Answer Export</h1>
        
        <h2>Answer</h2>
        <div class="answer">${parsedAnswer.main.replace(/\n/g, "<br>")}</div>
        
        ${parsedAnswer.summary ? `<h2>Summary</h2><div class="summary">${parsedAnswer.summary}</div>` : ""}
        
        ${
          parsedAnswer.keyPoints.length > 0
            ? `<h2>Key Points</h2><div class="key-points"><ul>${parsedAnswer.keyPoints.map((p) => `<li>${p}</li>`).join("")}</ul></div>`
            : ""
        }
        
        ${
          entities.length > 0
            ? `<h2>Key Entities</h2><div class="entities">${entities
                .slice(0, 15)
                .map((e) => `<span class="entity">${e.name} (${e.type})</span>`)
                .join("")}</div>`
            : ""
        }
        
        <p class="confidence">Confidence Score: ${Math.round(confidence * 100)}%</p>
        
        <div class="footer">
          Exported from Explainable RAG with Knowledge Graphs<br>
          Generated on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (!answer) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No answer available yet.</p>
        <p className="text-sm mt-2">
          Upload documents and submit a query to see results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confidence & Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-600">
              Confidence:
            </span>
            <div className="w-24">
              <ProgressBar
                value={confidence * 100}
                variant={
                  confidence > 0.7
                    ? "success"
                    : confidence > 0.4
                      ? "warning"
                      : "danger"
                }
                size="sm"
              />
            </div>
            <span className="text-sm font-bold text-gray-700">
              {Math.round(confidence * 100)}%
            </span>
          </div>
          {entities.length > 0 && (
            <Badge variant="primary" size="sm">
              {entities.length} entities
            </Badge>
          )}
          {snippets.length > 0 && (
            <Badge variant="success" size="sm">
              {snippets.length} sources
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={copied ? CheckCircle : Copy}
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={handleDownload}
          >
            JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={handleDownloadPDF}
          >
            Print/PDF
          </Button>
        </div>
      </div>

      {/* Summary Section */}
      {parsedAnswer.summary && (
        <Collapsible
          title="Summary"
          icon={Bookmark}
          defaultOpen={showSummary}
          badge={
            <Badge variant="info" size="xs">
              Quick Overview
            </Badge>
          }
        >
          <p className="text-gray-700 leading-relaxed">
            {parsedAnswer.summary}
          </p>
        </Collapsible>
      )}

      {/* Key Points Section */}
      {parsedAnswer.keyPoints.length > 0 && (
        <Collapsible
          title="Key Points"
          icon={CheckCircle}
          defaultOpen={showKeyPoints}
          badge={
            <Badge variant="success" size="xs">
              {parsedAnswer.keyPoints.length} points
            </Badge>
          }
        >
          <ul className="space-y-2">
            {parsedAnswer.keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </Collapsible>
      )}

      {/* Main Answer with Sentence Inspection */}
      <Card className="border-2 border-blue-200">
        <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">Detailed Answer</h3>
            </div>
            <Tooltip text="Click any sentence to inspect its sources">
              <Info className="w-4 h-4 text-blue-400" />
            </Tooltip>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {sentences.length > 0 ? (
              sentences.map((sentence, idx) => {
                const isSelected = selectedSentence === idx;
                const sentenceEntities = getEntitiesInSentence(sentence);
                const supportingSources =
                  getSupportingSourcesForSentence(sentence);
                const hasSupport =
                  sentenceEntities.length > 0 || supportingSources.length > 0;

                return (
                  <div key={idx} className="relative">
                    <button
                      onClick={() =>
                        setSelectedSentence(isSelected ? null : idx)
                      }
                      className={`
                        w-full text-left p-4 transition-colors
                        ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                        ${hasSupport ? "" : "opacity-80"}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`
                            flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${hasSupport ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}
                          `}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed">
                            {sentence}
                          </p>
                          {sentenceEntities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {sentenceEntities.slice(0, 5).map((e, i) => (
                                <Badge key={i} variant="purple" size="xs">
                                  {e.name}
                                </Badge>
                              ))}
                              {sentenceEntities.length > 5 && (
                                <Badge variant="default" size="xs">
                                  +{sentenceEntities.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Eye
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isSelected ? "text-blue-600" : "text-gray-300"
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded Sentence Details */}
                    {isSelected && (
                      <div className="bg-blue-50 border-t border-blue-100 p-4 animate-slideDown">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Supporting Entities */}
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-purple-500" />
                              Supporting Entities ({sentenceEntities.length})
                            </h4>
                            {sentenceEntities.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {sentenceEntities.map((e, i) => (
                                  <button
                                    key={i}
                                    onClick={() => onEntityClick?.(e)}
                                    className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition-colors"
                                  >
                                    {e.name}
                                    <span className="ml-1 text-purple-400 text-xs">
                                      ({e.type})
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm">
                                No entities detected
                              </p>
                            )}
                          </div>

                          {/* Supporting Sources */}
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-emerald-500" />
                              Source Evidence ({supportingSources.length})
                            </h4>
                            {supportingSources.length > 0 ? (
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {supportingSources
                                  .slice(0, 3)
                                  .map(({ snippet, idx: sIdx }, i) => (
                                    <button
                                      key={i}
                                      onClick={() => onSourceClick?.(sIdx)}
                                      className="w-full text-left p-2 bg-emerald-50 rounded text-xs text-emerald-800 hover:bg-emerald-100 transition-colors"
                                    >
                                      <span className="font-semibold">
                                        Source {sIdx + 1}:
                                      </span>{" "}
                                      {snippet?.slice(0, 100)}...
                                    </button>
                                  ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-amber-600 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>No direct source match found</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
                {parsedAnswer.main || answer}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
