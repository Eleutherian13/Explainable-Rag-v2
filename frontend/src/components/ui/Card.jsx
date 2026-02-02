import React from "react";

/**
 * Reusable Card component with consistent styling
 */
export function Card({
  children,
  className = "",
  gradient = false,
  hover = false,
}) {
  return (
    <div
      className={`
        rounded-xl shadow-lg border border-gray-100 overflow-hidden
        ${gradient ? "bg-gradient-to-br from-white to-gray-50" : "bg-white"}
        ${hover ? "hover:shadow-xl transition-shadow duration-300" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  icon: Icon,
  title,
  subtitle,
  gradient = false,
}) {
  const bgClass = gradient
    ? "bg-gradient-to-r from-blue-600 to-indigo-600"
    : "bg-white border-b border-gray-100";
  const textClass = gradient ? "text-white" : "text-gray-900";
  const subtitleClass = gradient ? "text-blue-100" : "text-gray-500";

  return (
    <div className={`px-6 py-5 ${bgClass} ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon
            className={`w-6 h-6 ${gradient ? "text-white" : "text-blue-600"}`}
          />
        )}
        <div>
          {title && (
            <h3 className={`text-lg font-bold ${textClass}`}>{title}</h3>
          )}
          {subtitle && <p className={`text-sm ${subtitleClass}`}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div
      className={`px-6 py-4 bg-gray-50 border-t border-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}
