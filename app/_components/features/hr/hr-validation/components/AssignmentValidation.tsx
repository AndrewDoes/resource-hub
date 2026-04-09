'use client';

import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { AssignmentRequest } from '../types';

interface AssignmentValidationProps {
  assignmentRequests: AssignmentRequest[];
  onApprove: (id: string) => void | Promise<void>;
  onReject: (id: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function AssignmentValidation({
  assignmentRequests,
  onApprove,
  onReject,
  isLoading = false,
}: AssignmentValidationProps) {
  const pendingAssignments = assignmentRequests.filter((a) => a.status === 'pending');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-700" />
          <h2 className="text-sm font-semibold text-gray-900">Final Assignment Validation</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">Cross-check remaining allocation</p>
      </div>

      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-gray-50 border border-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : pendingAssignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No pending assignment validations</p>
          </div>
        ) : (
          pendingAssignments.map((request) => (
            <div
              key={request.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold">{request.employeeAvatar}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{request.employeeName}</h4>
                    <p className="text-sm text-gray-600">{request.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Project</p>
                  <p className="text-sm font-bold text-gray-900">{request.projectName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-white rounded border border-gray-200">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Requested Allocation
                  </p>
                  <p className="text-lg font-bold text-blue-600">{request.allocation}%</p>
                </div>
                <div className="p-3 bg-white rounded border border-gray-200">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Requested By
                  </p>
                  <p className="text-sm font-semibold text-gray-700">{request.requestedBy}</p>
                </div>
              </div>

              {request.conflictWarning && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {request.conflictWarning}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(request.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Allocation
                </button>
                <button
                  onClick={() => onReject(request.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
