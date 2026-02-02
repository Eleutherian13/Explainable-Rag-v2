import React from "react";

/**
 * Badge component for labels and status indicators
 */
export function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}) {
  const variants = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    primary: "bg-blue-100 text-blue-700 border-blue-200",
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    info: "bg-cyan-100 text-cyan-700 border-cyan-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    pink: "bg-pink-100 text-pink-700 border-pink-200",
  };

  const sizes = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

/**
 * Status Badge with dot indicator
 */
export function StatusBadge({ status, text }) {
  const statusStyles = {
    idle: { dot: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-600" },
    processing: {
      dot: "bg-blue-400 animate-pulse",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    success: {
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    error: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
    warning: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  };

  const style = statusStyles[status] || statusStyles.idle;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        ${style.bg} ${style.text}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
      {text}
    </span>
  );
}

/**
 * Entity Type Badge with predefined colors
 */
export function EntityBadge({ type, name }) {
  const typeColors = {
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
    UNKNOWN: "default",
  };

  const variant = typeColors[type?.toUpperCase()] || "default";

  return (
    <Badge variant={variant} size="sm">
      {name || type}
    </Badge>
  );
}
