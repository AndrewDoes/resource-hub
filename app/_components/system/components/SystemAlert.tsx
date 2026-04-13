'use client';

import { AlertTriangle, Info, Lightbulb, Users } from 'lucide-react';
import { ResourceConflict, SystemSuggestion } from '../types';

interface SystemAlertProps {
  conflict: ResourceConflict;
  onViewDetails: (conflict: ResourceConflict) => void;
  onApplySuggestion: (conflict: ResourceConflict, suggestion: SystemSuggestion) => void;
}

export function SystemAlert({ conflict, onViewDetails, onApplySuggestion }: SystemAlertProps) {
  const getIcon = () => {
    switch (conflict.severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Info className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getColorClasses = () => {
    switch (conflict.severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    }
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${getColorClasses()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{conflict.details}</h3>
          <div className="text-sm opacity-90 mb-3">
            Projects affected: {conflict.projectNames.join(', ')}
          </div>

          {conflict.suggestions.length > 0 && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="w-4 h-4" />
                System Recommendations:
              </div>
              {conflict.suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-white/80 backdrop-blur rounded-lg p-3 border border-current/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{suggestion.title}</p>
                      <p className="text-xs opacity-80 mt-1">{suggestion.description}</p>
                      <p className="text-xs opacity-70 mt-1">Impact: {suggestion.impact}</p>

                      {suggestion.alternatives && suggestion.alternatives.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium">Alternative Resources:</p>
                          {suggestion.alternatives.map((alt, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-white/50 rounded px-2 py-1 flex items-center gap-2"
                            >
                              <Users className="w-3 h-3" />
                              <span className="font-medium">{alt.employeeName}</span>
                              <span className="opacity-70">
                                {alt.availability}% available
                              </span>
                              <span className="opacity-70">
                                Skills: {alt.skills?.join(', ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onApplySuggestion(conflict, suggestion)}
                      className="ml-3 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-medium transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onViewDetails(conflict)}
            className="mt-3 text-xs font-medium underline hover:no-underline"
          >
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
}
