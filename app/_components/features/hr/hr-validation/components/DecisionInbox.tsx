'use client';

import { Zap, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { GMDecision } from '../types';
import { getDecisionTypeLabel, getDecisionTypeColor } from '../utils';

interface DecisionInboxProps {
  gmDecisions: GMDecision[];
  onExecute: (id: string) => void;
  onClarify: (id: string) => void;
}

export function DecisionInbox({ gmDecisions, onExecute, onClarify }: DecisionInboxProps) {
  const pendingDecisions = gmDecisions.filter((d) => d.status === 'pending');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">GM Decision Inbox</h2>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              TOP PRIORITY
            </span>
          </div>
          <p className="text-sm text-gray-500">Execute decisions from General Manager</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {pendingDecisions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No pending GM decisions</p>
          </div>
        ) : (
          pendingDecisions.map((decision) => (
            <div
              key={decision.id}
              className="bg-linear-to-br from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getDecisionTypeColor(
                        decision.type
                      )}`}
                    >
                      {getDecisionTypeLabel(decision.type)}
                    </span>
                    <span className="px-2 py-1 bg-white/60 rounded text-xs font-medium text-gray-700">
                      From GM
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {decision.projectName}
                  </h3>
                  <p className="text-sm text-gray-700 mt-2">{decision.details}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Deadline: {decision.deadline}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Submitted: {decision.submittedDate}
                  </div>
                </div>
              </div>

              {decision.affectedEmployees.length > 0 && (
                <div className="mb-4 p-3 bg-white/60 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Affected Employees:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {decision.affectedEmployees.map((emp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700 font-medium"
                      >
                        {emp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-purple-200">
                <button
                  onClick={() => onExecute(decision.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Execute
                </button>
                <button
                  onClick={() => onClarify(decision.id)}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Request Clarification
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
