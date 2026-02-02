import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Collapsible section with header
 */
export function Collapsible({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  className = "",
  headerClassName = "",
  badge,
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3
          bg-gray-50 hover:bg-gray-100 transition-colors
          ${headerClassName}
        `}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <span className="font-medium text-gray-700">{title}</span>
          {badge}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-white animate-slideDown">{children}</div>
      )}
    </div>
  );
}

/**
 * Progress bar component
 */
export function ProgressBar({
  value,
  max = 100,
  size = "md",
  variant = "primary",
  showLabel = false,
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-indigo-500",
    success: "bg-gradient-to-r from-emerald-500 to-green-500",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500",
    danger: "bg-gradient-to-r from-red-500 to-rose-500",
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}
      >
        <div
          className={`${sizes[size]} rounded-full transition-all duration-500 ${variants[variant]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

/**
 * Skeleton loading placeholder
 */
export function Skeleton({ className = "", variant = "text" }) {
  const variants = {
    text: "h-4 rounded",
    title: "h-6 w-3/4 rounded",
    avatar: "h-12 w-12 rounded-full",
    card: "h-32 rounded-lg",
    button: "h-10 w-24 rounded-lg",
  };

  return (
    <div
      className={`
        bg-gray-200 animate-pulse
        ${variants[variant]}
        ${className}
      `}
    ></div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12 px-4">
      {Icon && (
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-4 max-w-sm mx-auto">{description}</p>
      )}
      {action}
    </div>
  );
}

/**
 * Tooltip wrapper
 */
export function Tooltip({ children, text, position = "top" }) {
  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative group inline-block">
      {children}
      <span
        className={`
          absolute ${positions[position]} z-50
          px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none whitespace-nowrap
        `}
      >
        {text}
      </span>
    </div>
  );
}
