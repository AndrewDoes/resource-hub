'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useFeedbackToast } from '@/app/context/ToastContext';

// Types & Data
import { GMDecision, ContractAction, AssignmentRequest, HiringRequest, EmployeeStatus } from './types';
import { mockGMDecisions, mockContractActions, mockAssignmentRequests, mockHiringRequests, mockEmployeeStatus } from './data';

// Sub-components
import { DecisionInbox } from './components/DecisionInbox';
import { ContractExecutionPanel } from './components/ContractExecutionPanel';
import { AssignmentValidation } from './components/AssignmentValidation';
import { HiringActionPanel } from './components/HiringActionPanel';
import { EmployeeStatusControl } from './components/EmployeeStatusControl';

export function HRValidation() {
  const [gmDecisions, setGmDecisions] = useState<GMDecision[]>(mockGMDecisions);
  const [contractActions, setContractActions] = useState<ContractAction[]>(mockContractActions);
  const [assignmentRequests, setAssignmentRequests] = useState<AssignmentRequest[]>(mockAssignmentRequests);
  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>(mockHiringRequests);
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus[]>(mockEmployeeStatus);
  const { addToast } = useFeedbackToast();

  const handleExecuteDecision = (id: string) => {
    setGmDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'executed' } : d))
    );
    addToast({
      type: 'success',
      title: 'Decision Executed',
      message: 'The GM workflow has been executed correctly.',
    });
  };

  const handleClarifyDecision = (id: string) => {
    setGmDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'clarification-requested' } : d))
    );
    addToast({
      type: 'info',
      title: 'Clarification Requested',
      message: 'A clarification has been requested to the GM.',
    });
  };

  const handleExecuteContract = (id: string) => {
    setContractActions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'executed' } : c))
    );
    addToast({
      type: 'success',
      title: 'Contract Executed',
      message: 'The contract has been executed successfully.',
    });
  };

  const handleApproveAssignment = (id: string) => {
    setAssignmentRequests((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a))
    );
    addToast({
      type: 'success',
      title: 'Assignment Approved',
      message: 'The requested resource allocation has been approved.',
    });
  };

  const handleRejectAssignment = (id: string) => {
    setAssignmentRequests((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
    );
    addToast({
      type: 'error',
      title: 'Assignment Rejected',
      message: 'The assignment request has been rejected.',
    });
  };

  const handleStartHiring = (id: string) => {
    setHiringRequests((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: 'in-progress' } : h))
    );
    addToast({
      type: 'success',
      title: 'Hiring Process Started',
      message: 'The hiring process has been initiated successfully.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">HR Validation & Execution</h1>
          <p className="text-sm text-gray-500 mt-1">
            Execute GM decisions, manage contracts, and validate allocations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg flex items-center gap-2 font-medium text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Validation Mode Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <DecisionInbox
            gmDecisions={gmDecisions}
            onExecute={handleExecuteDecision}
            onClarify={handleClarifyDecision}
          />

        </div>
        <div className="grid grid-cols-2 gap-6">
          <ContractExecutionPanel
            contractActions={contractActions}
            onExecute={handleExecuteContract}
          />
          <HiringActionPanel
            hiringRequests={hiringRequests}
            onStartHiring={handleStartHiring}
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <EmployeeStatusControl
            employeeStatus={employeeStatus}
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <AssignmentValidation
            assignmentRequests={assignmentRequests}
            onApprove={handleApproveAssignment}
            onReject={handleRejectAssignment}
          />
        </div>
      </div>
    </div>
  );
}
