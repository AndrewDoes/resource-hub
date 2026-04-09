'use client';

import { FileText, Calendar, CheckCircle } from 'lucide-react';
import { ContractAction } from '../types';

interface ContractExecutionPanelProps {
  contractActions: ContractAction[];
  onExecute: (id: string) => void;
}

export function ContractExecutionPanel({ contractActions, onExecute }: ContractExecutionPanelProps) {
  const pendingContracts = contractActions.filter((c) => c.status === 'pending');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-700" />
          <h2 className="text-sm font-semibold text-gray-900">Contract Execution Panel</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">Based on GM Decision</p>
      </div>

      <div className="p-6 space-y-3">
        {pendingContracts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">No pending contract actions</p>
          </div>
        ) : (
          pendingContracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {contract.employeeAvatar}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{contract.employeeName}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Project: {contract.assignedProject}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Contract ends: {contract.currentContractEnd}</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  Based on GM Decision
                </span>
              </div>

              <button
                onClick={() => onExecute(contract.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                {contract.action === 'extend' ? 'Extend Contract' : 'Terminate Contract'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
