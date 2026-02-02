import React from "react";

/**
 * Tab navigation component
 */
export function Tabs({ tabs, activeTab, onTabChange, className = "" }) {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="flex gap-1 px-4" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium
                transition-all duration-200 rounded-t-lg
                ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`
                    ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold
                    ${isActive ? "bg-blue-200 text-blue-700" : "bg-gray-200 text-gray-600"}
                  `}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t"></span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * Tab Panel container
 */
export function TabPanel({ children, isActive, className = "" }) {
  if (!isActive) return null;

  return (
    <div className={`animate-fadeIn ${className}`} role="tabpanel">
      {children}
    </div>
  );
}
