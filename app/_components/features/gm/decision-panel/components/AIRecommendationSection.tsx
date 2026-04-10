'use client';

import { useEffect, useState } from 'react';
import { 
  Lightbulb, AlertTriangle, Clock, HelpCircle, DollarSign, TrendingUp, Info, CheckCircle, X
} from 'lucide-react';
import { ProjectData, AIRecommendation } from '../types';

interface AIRecommendationSectionProps {
  project: ProjectData;
  recommendations: AIRecommendation[];
  onApply: (recommendation: AIRecommendation) => Promise<boolean>;
  onReject: (recommendation: AIRecommendation) => Promise<boolean>;
}

export function AIRecommendationSection({
  project,
  recommendations,
  onApply,
  onReject,
}: AIRecommendationSectionProps) {
  const [expandedReason, setExpandedReason] = useState<string | null>(null);
  const [localRecommendations, setLocalRecommendations] = useState<AIRecommendation[]>(recommendations);
  const [recommendationDecisions, setRecommendationDecisions] = useState<Record<string, 'pending' | 'applied' | 'rejected'>>({});
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AIRecommendation | null>(null);

  useEffect(() => {
    setLocalRecommendations(recommendations);
    setRecommendationDecisions({});
  }, [recommendations]);

  const pendingCount = localRecommendations.filter(
    (recommendation) => (recommendationDecisions[recommendation.id] ?? 'pending') === 'pending'
  ).length;

  const startEdit = (recommendation: AIRecommendation) => {
    setEditingId(recommendation.id);
    setDraft({
      ...recommendation,
      impact: { ...recommendation.impact },
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!editingId || !draft) {
      return;
    }

    const normalizedConfidence = Math.max(0, Math.min(100, Math.round(draft.confidence)));

    setLocalRecommendations((prev) =>
      prev.map((recommendation) =>
        recommendation.id === editingId
          ? {
              ...draft,
              confidence: normalizedConfidence,
            }
          : recommendation
      )
    );

    cancelEdit();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">AI Recommendation</h3>
        </div>
        <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
          {pendingCount} pending suggestion{pendingCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {localRecommendations.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            No recommendation was returned by the backend for this project.
          </div>
        )}
        {localRecommendations.map((recommendation) => (
          (() => {
            const decisionState = recommendationDecisions[recommendation.id] ?? 'pending';
            const isApplied = decisionState === 'applied';
            const isRejected = decisionState === 'rejected';

            return (
          <div
            key={recommendation.id}
            className={`border rounded-lg p-4 transition-colors ${
              isApplied
                ? 'border-green-300 bg-green-50'
                : isRejected
                  ? 'border-gray-300 bg-gray-100 opacity-80'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {recommendation.title}
                  </h4>
                  {isApplied && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Applied
                    </span>
                  )}
                  {isRejected && (
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                      Rejected
                    </span>
                  )}
                  <button
                    onClick={() =>
                      setExpandedReason(
                        expandedReason === recommendation.id ? null : recommendation.id
                      )
                    }
                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                    disabled={isRejected}
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
                onClick={async () => {
                  setActiveActionId(recommendation.id);
                  const success = await onApply(recommendation);
                  if (success) {
                    setRecommendationDecisions((prev) => ({ ...prev, [recommendation.id]: 'applied' }));
                  }
                  setActiveActionId(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm ${
                  isApplied
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={isApplied || isRejected || activeActionId === recommendation.id}
              >
                <CheckCircle className="w-4 h-4" />
                {isApplied ? 'Applied' : 'Apply'}
              </button>
              <button
                onClick={() => startEdit(recommendation)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                disabled={isRejected}
              >
                Modify Manually
              </button>
              <button
                onClick={async () => {
                  setActiveActionId(recommendation.id);
                  const success = await onReject(recommendation);
                  if (success) {
                    setRecommendationDecisions((prev) => ({ ...prev, [recommendation.id]: 'rejected' }));
                  }
                  setActiveActionId(null);
                }}
                className={`px-4 py-2 border rounded-lg transition-colors text-sm font-medium ${
                  isRejected
                    ? 'bg-gray-200 border-gray-300 text-gray-700 cursor-default'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                disabled={isApplied || isRejected || activeActionId === recommendation.id}
              >
                {isRejected ? 'Rejected' : 'Reject'}
              </button>
            </div>
          </div>
            );
          })()
        ))}
      </div>

      {editingId && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Modify Recommendation</h4>
                <p className="text-xs text-gray-500 mt-1">{project.name}</p>
              </div>
              <button
                onClick={cancelEdit}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Close recommendation editor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium text-gray-600">Title</span>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => (prev ? { ...prev, title: event.target.value } : prev))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium text-gray-600">Description</span>
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((prev) => (prev ? { ...prev, description: event.target.value } : prev))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Impact: Time</span>
                <input
                  value={draft.impact.time ?? ''}
                  onChange={(event) =>
                    setDraft((prev) =>
                      prev ? { ...prev, impact: { ...prev.impact, time: event.target.value || undefined } } : prev
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Impact: Cost</span>
                <input
                  value={draft.impact.cost ?? ''}
                  onChange={(event) =>
                    setDraft((prev) =>
                      prev ? { ...prev, impact: { ...prev.impact, cost: event.target.value || undefined } } : prev
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Impact: Risk</span>
                <input
                  value={draft.impact.risk ?? ''}
                  onChange={(event) =>
                    setDraft((prev) =>
                      prev ? { ...prev, impact: { ...prev.impact, risk: event.target.value || undefined } } : prev
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Impact: Workload</span>
                <input
                  value={draft.impact.workload ?? ''}
                  onChange={(event) =>
                    setDraft((prev) =>
                      prev ? { ...prev, impact: { ...prev.impact, workload: event.target.value || undefined } } : prev
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium text-gray-600">Confidence (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.confidence}
                  onChange={(event) =>
                    setDraft((prev) => (prev ? { ...prev, confidence: Number(event.target.value) } : prev))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium text-gray-600">Reasoning</span>
                <textarea
                  value={draft.reasoning}
                  onChange={(event) => setDraft((prev) => (prev ? { ...prev, reasoning: event.target.value } : prev))}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                onClick={cancelEdit}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Recommendation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
