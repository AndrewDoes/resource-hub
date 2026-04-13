'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Megaphone, XCircle } from 'lucide-react';
import type { GeneralManagerMarketingDraftProject } from '@/functions/api/generalManager';

interface MarketingDraftReviewSectionProps {
  projects: GeneralManagerMarketingDraftProject[];
  isLoading: boolean;
  onApprove: (project: GeneralManagerMarketingDraftProject) => Promise<boolean>;
  onReject: (project: GeneralManagerMarketingDraftProject, rejectionReason: string) => Promise<boolean>;
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

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

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
                      setActiveActionId(project.id);
                      await onApprove(project);
                      setActiveActionId(null);
                    }}
                    disabled={isActing}
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
