'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Megaphone, XCircle } from 'lucide-react';
import {
  fetchGeneralManagerProjectPrediction,
  type GeneralManagerMarketingDraftProject,
  type GeneralManagerProjectPrediction,
} from '@/functions/api/generalManager';

interface MarketingDraftReviewSectionProps {
  projects: GeneralManagerMarketingDraftProject[];
  isLoading: boolean;
  onApprove: (project: GeneralManagerMarketingDraftProject, pmOwnerUserId?: string) => Promise<boolean>;
  onReject: (project: GeneralManagerMarketingDraftProject, rejectionReason: string) => Promise<boolean>;
}

interface RecommendationInfo {
  loading: boolean;
  pmOwnerUserId: string | null;
  pmOwnerName: string | null;
  pmRequirementAlreadyFull: boolean;
  error: string | null;
}

const formatDate = (value: string): string => {
  if (!value) {
    return 'TBD';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'TBD';
  }

  return date.toLocaleDateString();
};

export function MarketingDraftReviewSection({
  projects,
  isLoading,
  onApprove,
  onReject,
}: MarketingDraftReviewSectionProps) {
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<Record<string, RecommendationInfo>>({});

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  useEffect(() => {
    let isMounted = true;

    const loadRecommendations = async () => {
      const nextState: Record<string, RecommendationInfo> = {};

      await Promise.all(
        sortedProjects.map(async (project) => {
          nextState[project.id] = {
            loading: true,
            pmOwnerUserId: null,
            pmOwnerName: null,
            pmRequirementAlreadyFull: false,
            error: null,
          };

          try {
            const prediction = await fetchGeneralManagerProjectPrediction(project.id, 5);
            const recommendation = pickRecommendedPm(prediction);
            const pmRequirementAlreadyFull = isPmRequirementAlreadyFull(prediction);

            nextState[project.id] = {
              loading: false,
              pmOwnerUserId: recommendation?.employeeId ?? null,
              pmOwnerName: recommendation?.fullName ?? null,
              pmRequirementAlreadyFull,
              error: null,
            };
          } catch (error) {
            nextState[project.id] = {
              loading: false,
              pmOwnerUserId: null,
              pmOwnerName: null,
              pmRequirementAlreadyFull: false,
              error: error instanceof Error ? error.message : 'Unable to load PM recommendation',
            };
          }
        })
      );

      if (isMounted) {
        setRecommendations(nextState);
      }
    };

    if (sortedProjects.length > 0) {
      void loadRecommendations();
    } else {
      setRecommendations({});
    }

    return () => {
      isMounted = false;
    };
  }, [sortedProjects]);

  const pickRecommendedPm = (prediction: GeneralManagerProjectPrediction) => {
    const prioritizedRequirements = [...prediction.requirements].sort((left, right) => {
      const leftIsPm = /project manager|\bpm\b/i.test(left.roleName);
      const rightIsPm = /project manager|\bpm\b/i.test(right.roleName);

      if (leftIsPm === rightIsPm) {
        return 0;
      }

      return leftIsPm ? -1 : 1;
    });

    const pmRequirement = prioritizedRequirements.find((requirement) => requirement.recommendedCandidates.length > 0);
    const pmCandidate = pmRequirement?.recommendedCandidates[0];

    if (pmCandidate) {
      return pmCandidate;
    }

    const allCandidates = prediction.requirements.flatMap((requirement) => requirement.recommendedCandidates);

    return allCandidates.sort((left, right) => right.fitScore - left.fitScore)[0] ?? null;
  };

  const isPmRequirementAlreadyFull = (prediction: GeneralManagerProjectPrediction) => {
    const pmRequirement = prediction.requirements.find((requirement) => /project manager|\bpm\b/i.test(requirement.roleName));

    if (!pmRequirement) {
      return false;
    }

    return pmRequirement.coverageScore >= 100 && pmRequirement.recommendedCandidates.length === 0;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Marketing Project Draft Reviews</h3>
        </div>
        <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full font-medium">
          {sortedProjects.length} pending
        </span>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          Loading project drafts from backend...
        </div>
      )}

      {!isLoading && sortedProjects.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600 text-center">
          No draft or submitted marketing projects are waiting for review.
        </div>
      )}

      {!isLoading && sortedProjects.length > 0 && (
        <div className="space-y-3">
          {sortedProjects.map((project) => {
            const statusLabel = project.status.trim().toLowerCase() === 'submitted' ? 'Submitted' : 'Draft';
            const reason = rejectionReasons[project.id] ?? '';
            const isActing = activeActionId === project.id;
            const recommendation = recommendations[project.id];

            return (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{project.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Timeline: {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </p>
                  </div>
                  <span className="text-xs font-medium rounded-full bg-amber-100 text-amber-800 px-2 py-1">
                    {statusLabel}
                  </span>
                </div>

                <div className="mb-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  {recommendation?.loading
                    ? 'Loading recommended PM from system...'
                    : recommendation?.pmRequirementAlreadyFull
                      ? 'No recommendation needed: PM requirement is already full.'
                    : recommendation?.pmOwnerName
                      ? `Recommended PM: ${recommendation.pmOwnerName}`
                      : 'No PM recommendation available yet.'}
                  {recommendation?.error && !recommendation?.loading && (
                    <div className="mt-1 text-[11px] text-blue-700/80">
                      {recommendation.error}
                    </div>
                  )}
                </div>

                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`rejection-reason-${project.id}`}>
                  Rejection reason (required for reject)
                </label>
                <textarea
                  id={`rejection-reason-${project.id}`}
                  value={reason}
                  onChange={(event) => {
                    const next = event.target.value;
                    setRejectionReasons((prev) => ({ ...prev, [project.id]: next }));
                  }}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide feedback for marketing if you reject this draft"
                />

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={async () => {
                      if (recommendation?.loading) {
                        return;
                      }

                      setActiveActionId(project.id);
                      await onApprove(project, recommendation?.pmOwnerUserId ?? undefined);
                      setActiveActionId(null);
                    }}
                    disabled={isActing || recommendation?.loading === true}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-green-600 text-white px-3 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={async () => {
                      const trimmedReason = reason.trim();
                      if (!trimmedReason) {
                        return;
                      }

                      setActiveActionId(project.id);
                      const success = await onReject(project, trimmedReason);
                      if (success) {
                        setRejectionReasons((prev) => {
                          const next = { ...prev };
                          delete next[project.id];
                          return next;
                        });
                      }
                      setActiveActionId(null);
                    }}
                    disabled={isActing || !reason.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-red-600 text-white px-3 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
