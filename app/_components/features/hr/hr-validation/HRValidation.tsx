'use client';

import { ShieldCheck } from 'lucide-react';
import { useFeedbackToast } from '@/app/context/ToastContext';

// Types & Data
import { GMDecision, ContractAction, AssignmentRequest, HiringRequest, EmployeeStatus } from './types';
import { mockGMDecisions, mockContractActions, mockAssignmentRequests, mockHiringRequests, mockEmployeeStatus } from './data';
import { useEffect, useState } from 'react';
import { fetchHREmployeeList, mapToUIEmployeeStatus, mapToUIContractAction, mapToUIDecision, fetchHRAssignmentRequests, mapToUIAssignmentRequest, updateAssignmentStatus } from '@/functions/api/humanResource';
import { fetchGeneralManagerContractDecisions, fetchGeneralManagerDecisions } from '@/functions/api/generalManager';

// Sub-components
import { DecisionInbox } from './components/DecisionInbox';
import { ContractExecutionPanel } from './components/ContractExecutionPanel';
import { AssignmentValidation } from './components/AssignmentValidation';
import { HiringActionPanel } from './components/HiringActionPanel';
import { EmployeeStatusControl } from './components/EmployeeStatusControl';
import { WorkloadStatusIndicator } from './components/WorkloadStatusIndicator';
import { WorkloadKPIs } from './components/WorkloadKPIs';

export function HRValidation() {
  const [gmDecisions, setGmDecisions] = useState<GMDecision[]>(mockGMDecisions);
  const [contractActions, setContractActions] = useState<ContractAction[]>(mockContractActions);
  const [assignmentRequests, setAssignmentRequests] = useState<AssignmentRequest[]>(mockAssignmentRequests);
  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>(mockHiringRequests);
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useFeedbackToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch Employees, Contract Decisions, and General Decisions in parallel
        const [apiEmployees, apiContractDecisions, apiGeneralDecisions, apiAssignmentRequests] = await Promise.all([
          fetchHREmployeeList(),
          fetchGeneralManagerContractDecisions(),
          fetchGeneralManagerDecisions(),
          fetchHRAssignmentRequests()
        ]);

        // Map Employee Status
        const uiStatus = apiEmployees.map(mapToUIEmployeeStatus);
        setEmployeeStatus(uiStatus);

        // Map Contract Actions
        const uiContractActions = apiContractDecisions.map(mapToUIContractAction);
        setContractActions(uiContractActions);

        // Map General Decisions
        const uiGeneralDecisions = apiGeneralDecisions.map(mapToUIDecision);
        setGmDecisions(uiGeneralDecisions);

        // Map Assignment Requests
        const uiAssignments = apiAssignmentRequests.map(mapToUIAssignmentRequest);
        setAssignmentRequests(uiAssignments);

        setError(null);
      } catch (err) {
        console.error('Error loading validation data:', err);
        setError('Failed to load validation data.');

        // Fallbacks
        setEmployeeStatus(mockEmployeeStatus);
        setContractActions(mockContractActions);
        setGmDecisions(mockGMDecisions);
        setAssignmentRequests(mockAssignmentRequests);

        addToast({
          type: 'error',
          title: 'Connection Error',
          message: 'Using offline data for validation highlights.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [addToast]);

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

  const handleApproveAssignment = async (id: string) => {
    try {
      const success = await updateAssignmentStatus(id, 'Approved');
      if (success) {
        setAssignmentRequests((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a))
        );
        addToast({
          type: 'success',
          title: 'Assignment Approved',
          message: 'The requested resource allocation has been approved.',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not approve the assignment at this time.',
      });
    }
  };

  const handleRejectAssignment = async (id: string) => {
    try {
      const success = await updateAssignmentStatus(id, 'Rejected');
      if (success) {
        setAssignmentRequests((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
        );
        addToast({
          type: 'error',
          title: 'Assignment Rejected',
          message: 'The assignment request has been rejected.',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not reject the assignment at this time.',
      });
    }
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
        <WorkloadStatusIndicator />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm animate-pulse">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading live resource status...</p>
          </div>
        ) : (
          <WorkloadKPIs employeeStatus={employeeStatus} />
        )}

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm animate-pulse">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Loading decision inbox...</p>
            </div>
          ) : (
            <DecisionInbox
              gmDecisions={gmDecisions}
              onExecute={handleExecuteDecision}
              onClarify={handleClarifyDecision}
            />
          )}

        </div>
        <div className="grid grid-cols-2 gap-6">
          {isLoading ? (
            <div className="h-64 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Loading contract actions...</p>
            </div>
          ) : (
            <ContractExecutionPanel
              contractActions={contractActions}
              onExecute={handleExecuteContract}
            />
          )}
          <HiringActionPanel
            hiringRequests={hiringRequests}
            onStartHiring={handleStartHiring}
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="h-64 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Loading employee status table...</p>
            </div>
          ) : (
            <EmployeeStatusControl
              employeeStatus={employeeStatus}
            />
          )}
          <AssignmentValidation
            assignmentRequests={assignmentRequests}
            onApprove={handleApproveAssignment}
            onReject={handleRejectAssignment}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
