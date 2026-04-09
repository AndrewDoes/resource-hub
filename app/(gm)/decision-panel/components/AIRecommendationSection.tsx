'use client';

import { useState } from 'react';
import { 
  Lightbulb, AlertTriangle, Clock, HelpCircle, DollarSign, TrendingUp, Info, CheckCircle 
} from 'lucide-react';
import { ProjectData, AIRecommendation } from '../types';

interface AIRecommendationSectionProps {
  project: ProjectData;
  recommendations: AIRecommendation[];
  onApply: (recommendation: AIRecommendation) => void;
  onReject: (recommendation: AIRecommendation) => void;
  onModify: () => void;
}

export function AIRecommendationSection({
  project,
  recommendations,
  onApply,
  onReject,
  onModify,
}: AIRecommendationSectionProps) {
  const [expandedReason, setExpandedReason] = useState<string | null>(null);

  const resourceGap = project.requiredResources - project.assignedResources.length;
  const delayPrediction = project.resourceUtilization > 100
    ? Math.floor((project.resourceUtilization - 100) * 0.5)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">AI Recommendation</h3>
        </div>
        <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
          {recommendations.length} suggestion{recommendations.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Alert Indicators */}
      {(resourceGap > 0 || delayPrediction > 0) && (
        <div className="space-y-2 mb-4">
          {resourceGap > 0 && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Resource Gap</p>
                <p className="text-xs text-gray-700 mt-0.5">
                  Need {resourceGap} more resource{resourceGap > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {delayPrediction > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Clock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Timeline Risk</p>
                <p className="text-xs text-gray-700 mt-0.5">
                  Predicted +{delayPrediction} days delay
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations List */}
      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-gray-50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {recommendation.title}
                  </h4>
                  <button
                    onClick={() =>
                      setExpandedReason(
                        expandedReason === recommendation.id ? null : recommendation.id
                      )
                    }
                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>

                {/* Impact Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {recommendation.impact.time && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {recommendation.impact.time}
                      </span>
                    </div>
                  )}
                  {recommendation.impact.cost && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {recommendation.impact.cost}
                      </span>
                    </div>
                  )}
                  {recommendation.impact.risk && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {recommendation.impact.risk}
                      </span>
                    </div>
                  )}
                  {recommendation.impact.workload && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {recommendation.impact.workload}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confidence Level */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${recommendation.confidence >= 85
                          ? 'bg-green-500'
                          : recommendation.confidence >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      style={{ width: `${recommendation.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {recommendation.confidence}% confidence
                  </span>
                </div>
              </div>
            </div>

            {/* Reasoning (Expandable) */}
            {expandedReason === recommendation.id && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-900">
                    Why this recommendation?
                  </p>
                </div>
                <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => onApply(recommendation)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Apply
              </button>
              <button
                onClick={onModify}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Modify Manually
              </button>
              <button
                onClick={() => onReject(recommendation)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
