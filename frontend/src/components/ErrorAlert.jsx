import React, { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { useAppStore } from "../store/appStore";

export default function ErrorAlert() {
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setError(null), 300);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  if (!error) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-96 opacity-0"
      }`}
    >
      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 rounded-lg p-4 flex items-start gap-3 shadow-lg max-w-md">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">Error</h3>
          <p className="text-sm text-red-700 leading-relaxed break-words">
            {error}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => setError(null), 300);
          }}
          className="text-red-600 hover:text-red-800 hover:bg-red-200 rounded-md p-1 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
