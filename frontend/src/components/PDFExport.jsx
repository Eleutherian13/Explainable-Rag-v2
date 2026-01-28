import React, { useState, useEffect } from "react";
import { Download, BarChart3, Loader } from "lucide-react";

export default function PDFExport({ results, query }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownloadPDF = async () => {
    if (!results || !results.pdf_html) {
      setError("No PDF data available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create blob from HTML
      const element = document.createElement("div");
      element.innerHTML = results.pdf_html;
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin: 10,
        filename: `dataforge-report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" }
      };

      html2pdf().set(opt).from(results.pdf_html).save();
    } catch (err) {
      console.error("PDF error:", err);
      setError("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <Download className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-bold">Export Results</h3>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">
          Download a comprehensive PDF report with your query, answer, entities, and data pipeline.
        </p>

        <button
          onClick={handleDownloadPDF}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download PDF Report
            </>
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
