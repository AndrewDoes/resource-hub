'use client';

import { Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { ContractDecision } from '../types';

interface ContractDecisionSectionProps {
  decisions: ContractDecision[];
  onRequestHrReview: (decisionId: string, requestedAction: 'ExtendContract' | 'TerminateContract') => Promise<void>;
}

export function ContractDecisionSection({
  decisions,
  onRequestHrReview,
}: ContractDecisionSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-700" />
        <h3 className="text-sm font-semibold text-gray-900">Contract Decision</h3>
      </div>

      <div className="space-y-3">
        {decisions.map((decision) => (
          <div
            key={decision.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-medium">
                  {decision.employeeAvatar}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {decision.employeeName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {decision.jobTitle} - {decision.activeAssignmentCount} project{decision.activeAssignmentCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Availability: {decision.availabilityPercent}%</p>
                    <p className="text-xs text-gray-600">Workload: {decision.workloadPercent}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Contract ends: {decision.contractEndDate}</span>
                </div>
              </div>
            </div>

            {decision.decisionStatus.toLowerCase() === 'pending' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => void onRequestHrReview(decision.id, 'ExtendContract')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Request HR: Extend
                </button>
                <button
                  onClick={() => void onRequestHrReview(decision.id, 'TerminateContract')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  Request HR: Terminate
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {decision.decisionType}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium uppercase">
                  {decision.decisionStatus}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
