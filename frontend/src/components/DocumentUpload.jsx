import React, { useState, useEffect } from "react";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader,
  Download,
  FileJson,
} from "lucide-react";
import { useAppStore } from "../store/appStore";
import {
  uploadDocuments,
  checkUploadStatus,
  exportChunks,
  exportEntities,
  exportGraph,
  exportReasoningTrace,
} from "../services/api";

export default function DocumentUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // PHASE 1: Real-time processing status
  const [showProcessingStatus, setShowProcessingStatus] = useState(false);
  const [processingDetails, setProcessingDetails] = useState(null);
  const [processingInterval, setProcessingInterval] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const setIndexId = useAppStore((state) => state.setIndexId);
  const indexId = useAppStore((state) => state.indexId);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const isLoading = useAppStore((state) => state.isLoading);

  const validateFiles = (filesToValidate) => {
    const errors = {};
    const supportedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/x-yaml",
    ];
    const maxSize = 50 * 1024 * 1024; // 50MB

    filesToValidate.forEach((file, idx) => {
      if (
        !supportedTypes.includes(file.type) &&
        !file.name.match(/\.(pdf|txt|md|yaml|yml)$/i)
      ) {
        errors[idx] = `Invalid file type. Supported: PDF, TXT, MD`;
      }
      if (file.size > maxSize) {
        errors[idx] = `File too large (max 50MB)`;
      }
      if (file.size === 0) {
        errors[idx] = `File is empty`;
      }
    });

    return errors;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadSuccess(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const errors = validateFiles(droppedFiles);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("Some files failed validation");
      return;
    }

    setValidationErrors({});
    setError(null);
    setFiles(droppedFiles);
  };

  const handleChange = (e) => {
    setUploadSuccess(false);
    const selectedFiles = Array.from(e.target.files);
    const errors = validateFiles(selectedFiles);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("Some files failed validation");
      return;
    }

    setValidationErrors({});
    setError(null);
    setFiles(selectedFiles);
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  // PHASE 1: Poll upload status
  const pollUploadStatus = async (sessionId) => {
    try {
      const status = await checkUploadStatus(sessionId);
      console.log("[PHASE1] Upload status:", status);
      setProcessingDetails(status);

      // Stop polling when done
      if (
        status.overall_status === "completed" ||
        status.overall_status === "error"
      ) {
        if (processingInterval) {
          clearInterval(processingInterval);
          setProcessingInterval(null);
        }

        if (status.overall_status === "completed") {
          setUploadSuccess(true);
          setShowProcessingStatus(false);
        }
      }
    } catch (error) {
      console.error("[PHASE1] Error polling status:", error);
    }
  };

  // PHASE 1: Start polling when upload begins
  useEffect(() => {
    if (showProcessingStatus && indexId && !processingInterval) {
      const interval = setInterval(() => {
        pollUploadStatus(indexId);
      }, 500); // Poll every 500ms for smooth updates

      setProcessingInterval(interval);
    }

    return () => {
      if (processingInterval) {
        clearInterval(processingInterval);
      }
    };
  }, [showProcessingStatus, indexId]);

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadSuccess(false);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 30;
        });
      }, 200);

      const result = await uploadDocuments(files);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setIndexId(result.index_id);

      // PHASE 1: Show real-time processing status
      setShowProcessingStatus(true);
      setFiles([]);
      setError(null);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadProgress(0);
      }, 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to upload documents";
      setError(errorMessage);
      setUploadProgress(0);
      setShowProcessingStatus(false);
    } finally {
      setLoading(false);
    }
  };

  // PHASE 1: Export functions
  const handleExport = async (exportFunction, exportName) => {
    if (!indexId) {
      setExportError("No session available. Please upload documents first.");
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const data = await exportFunction(indexId);

      // Download as JSON
      const jsonString = JSON.stringify(data.content, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Error exporting ${exportName}:`, error);
      setExportError(`Failed to export ${exportName}: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Success Message */}
      {uploadSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800">Upload Successful!</h3>
            <p className="text-sm text-green-700 mt-1">
              Your documents have been processed and indexed successfully. You
              can now ask questions or export the data.
            </p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="w-8 h-8 text-white" />
            <h2 className="text-3xl font-bold text-white">Upload Documents</h2>
          </div>
          <p className="text-blue-100 text-sm">
            Upload your documents to create a knowledge base
          </p>
        </div>

        <div className="p-8">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? "border-blue-500 bg-blue-50 shadow-md scale-105"
                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-25"
            }`}
          >
            <input
              type="file"
              multiple
              onChange={handleChange}
              accept=".pdf,.txt,.md,.yaml,.yml"
              className="hidden"
              id="file-input"
              disabled={isLoading}
            />
            <label htmlFor="file-input" className="cursor-pointer block">
              <div className="flex justify-center mb-4">
                <Upload className="w-16 h-16 text-blue-400 opacity-60" />
              </div>
              <p className="text-xl font-bold text-gray-700 mb-2">
                Drag and drop your files here
              </p>
              <p className="text-gray-600 mb-3">or click to browse</p>
              <div className="flex flex-wrap gap-2 justify-center mb-2">
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                  PDF
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                  TXT
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                  MD
                </span>
              </div>
              <p className="text-xs text-gray-500">Max 50MB per file</p>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {validationErrors[idx] ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium">
                          {validationErrors[idx]}
                        </span>
                      </div>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                    {!validationErrors[idx] && (
                      <button
                        onClick={() => removeFile(idx)}
                        className="ml-2 p-1 hover:bg-gray-200 rounded-md transition-colors"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploadProgress > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Uploading...
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-700 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* PHASE 1: Real-time Processing Status */}
          {showProcessingStatus && processingDetails && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Processing Documents ({processingDetails.current_stage})
              </h3>

              {processingDetails.documents &&
                processingDetails.documents.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {processingDetails.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2 rounded border border-blue-100"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {doc.filename}
                          </span>
                          <span className="text-xs font-semibold text-blue-600">
                            {doc.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 transition-all duration-300"
                            style={{ width: `${doc.progress}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {doc.status === "indexed" && (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          )}
                          <span className="text-xs text-gray-600">
                            {doc.status}
                          </span>
                          {doc.chunks_count > 0 && (
                            <span className="text-xs text-gray-500">
                              ({doc.chunks_count} chunks)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2 rounded border border-blue-100">
                  <p className="text-gray-600">Total Chunks</p>
                  <p className="font-bold text-blue-600">
                    {processingDetails.total_chunks}
                  </p>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100">
                  <p className="text-gray-600">Entities</p>
                  <p className="font-bold text-blue-600">
                    {processingDetails.total_entities}
                  </p>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100">
                  <p className="text-gray-600">Graph Edges</p>
                  <p className="font-bold text-blue-600">
                    {processingDetails.total_graph_edges}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={
              files.length === 0 ||
              isLoading ||
              Object.keys(validationErrors).length > 0
            }
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload & Index Documents
              </>
            )}
          </button>

          {/* PHASE 1: Export Options */}
          {uploadSuccess && indexId && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Indexed Data
              </h3>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  onClick={() => handleExport(exportChunks, "chunks")}
                  disabled={isExporting}
                  className="p-2 bg-white border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors flex flex-col items-center gap-1 text-xs"
                >
                  <FileJson className="w-4 h-4 text-green-600" />
                  <span>Chunks</span>
                </button>
                <button
                  onClick={() => handleExport(exportEntities, "entities")}
                  disabled={isExporting}
                  className="p-2 bg-white border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors flex flex-col items-center gap-1 text-xs"
                >
                  <FileJson className="w-4 h-4 text-green-600" />
                  <span>Entities</span>
                </button>
                <button
                  onClick={() => handleExport(exportGraph, "graph")}
                  disabled={isExporting}
                  className="p-2 bg-white border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors flex flex-col items-center gap-1 text-xs"
                >
                  <FileJson className="w-4 h-4 text-green-600" />
                  <span>Graph</span>
                </button>
                <button
                  onClick={() => handleExport(exportReasoningTrace, "trace")}
                  disabled={isExporting}
                  className="p-2 bg-white border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors flex flex-col items-center gap-1 text-xs"
                >
                  <FileJson className="w-4 h-4 text-green-600" />
                  <span>Trace</span>
                </button>
              </div>

              {exportError && (
                <div className="mt-2 text-xs text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{exportError}</span>
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Clear all uploaded documents? This cannot be undone.",
                    )
                  ) {
                    setIndexId(null);
                    setUploadSuccess(false);
                    setFiles([]);
                  }
                }}
                className="mt-4 w-full p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4 inline mr-2" />
                Clear All Documents
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Tip:</span> You can upload
              multiple files at once. They will be processed and indexed
              together into a single knowledge base.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
