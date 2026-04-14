'use client';

import { ShieldCheck } from 'lucide-react';
import { useFeedbackToast } from '@/app/context/ToastContext';

// Types & Data
import { GMDecision, ContractAction, AssignmentRequest, HiringRequest, EmployeeStatus } from './types';
import { mockGMDecisions, mockContractActions, mockAssignmentRequests, mockHiringRequests, mockEmployeeStatus } from './data';
import { useEffect, useState } from 'react';
import { fetchHREmployeeList, mapToUIEmployeeStatus, mapToUIContractAction, mapToUIDecision, fetchHRAssignmentRequests, mapToUIAssignmentRequest, updateAssignmentStatus, executeDecision, executeContractAction, startHiring, requestClarification } from '@/functions/api/humanResource';
import { fetchGeneralManagerContractDecisions, fetchGeneralManagerDecisions } from '@/functions/api/generalManager';

// Sub-components
import { DecisionInbox } from './components/DecisionInbox';
import { ContractExecutionPanel } from './components/ContractExecutionPanel';
import { AssignmentValidation } from './components/AssignmentValidation';
import { HiringActionPanel } from './components/HiringActionPanel';
import { EmployeeStatusControl } from './components/EmployeeStatusControl';
import { WorkloadStatusIndicator } from './components/WorkloadStatusIndicator';
import { WorkloadKPIs } from './components/WorkloadKPIs';
import { ClarificationModal } from './components/ClarificationModal';

export function HRValidation() {
  const [gmDecisions, setGmDecisions] = useState<GMDecision[]>(mockGMDecisions);
  const [contractActions, setContractActions] = useState<ContractAction[]>(mockContractActions);
  const [assignmentRequests, setAssignmentRequests] = useState<AssignmentRequest[]>(mockAssignmentRequests);
  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>(mockHiringRequests);
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useFeedbackToast();

  // Modal State
  const [isClarifyModalOpen, setIsClarifyModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<GMDecision | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

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

        // Map Employee Status - Filter out terminated and resigned employees for validation view
        const uiStatus = apiEmployees
          .filter(emp => {
            const s = emp.status?.toLowerCase();
            return s !== 'terminated' && s !== 'resigned';
          })
          .map(mapToUIEmployeeStatus);
        setEmployeeStatus(uiStatus);

        // Map Contract Actions
        const uiContractActions = apiContractDecisions.map(mapToUIContractAction);
        setContractActions(uiContractActions);

        // Map General Decisions
        const uiGeneralDecisions = apiGeneralDecisions.map(mapToUIDecision);
        setGmDecisions(uiGeneralDecisions);

        // Map Hiring Requests from GM Decisions (type 'hire-resource')
        const uiHiringRequests = uiGeneralDecisions
          .filter(d => d.type === 'hire-resource' && d.status === 'pending')
          .map(d => {
            // Try to extract quantity and role from details string
            // Example: "Hire 2 Backend Developers (Senior level) - Skills: Node.js, PostgreSQL, AWS"
            const details = d.details || "";
            const quantityMatch = details.match(/Hire (\d+)/i);
            const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;

            // Try to find role name (between quantity and skills/bracket)
            const roleMatch = details.match(/Hire \d+ (.*?) (\(|-)/i) || details.match(/Hire \d+ (.*)/i);
            const role = roleMatch ? roleMatch[1].trim() : "New Resource";

            const skillsMatch = details.match(/Skills: (.*)/i);
            const skills = skillsMatch ? skillsMatch[1].split(',').map((s: string) => s.trim()) : [];

            return {
              id: d.id,
              role: role,
              quantity: quantity,
              skillRequirements: skills,
              projectName: d.projectName,
              gmDecisionId: d.id,
              status: 'pending' as const
            };
          });
        setHiringRequests(uiHiringRequests);

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

  // Helper to sync "Executed" status across all local lists
  const markDecisionExecuted = (id: string, newStatus: string = 'executed') => {
    setGmDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus as any } : d))
    );
    setContractActions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus as any } : c))
    );
    setHiringRequests((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: newStatus === 'executed' ? 'in-progress' : newStatus as any } : h))
    );
  };

  const handleExecuteDecision = async (id: string) => {
    const decision = gmDecisions.find(d => d.id === id);
    if (!decision) return;

    try {
      let success = false;
      const type = decision.type.toLowerCase();

      // Route to correct API based on decision type
      if (type.includes('contract')) {
        success = await executeContractAction(id);
      } else if (type.includes('hire')) {
        success = await startHiring(id);
      } else {
        // Default to project assignment / generic decision
        success = await executeDecision(id);
      }

      if (success) {
        markDecisionExecuted(id);
        // Reload all data to ensure sync
        window.location.reload();
        addToast({
          type: 'success',
          title: 'Action Executed',
          message: `The ${decision.type} has been successfully processed.`,
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Execution Failed',
        message: 'Could not execute the decision at this time.',
      });
    }
  };

  const handleClarifyDecision = (id: string) => {
    const decision = gmDecisions.find(d => d.id === id);
    if (!decision) return;

    setSelectedDecision(decision);
    setIsClarifyModalOpen(true);
  };

  const handleConfirmClarification = async (reason: string) => {
    if (!selectedDecision) return;

    try {
      setIsSubmitLoading(true);
      const success = await requestClarification(selectedDecision.id, reason);

      if (success) {
        markDecisionExecuted(selectedDecision.id, 'clarification-requested');
        setIsClarifyModalOpen(false);
        setSelectedDecision(null);
        addToast({
          type: 'info',
          title: 'Clarification Requested',
          message: 'Your feedback has been sent to the GM.',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: 'Could not send the clarification request.',
      });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleExecuteContract = async (id: string) => {
    try {
      const success = await executeContractAction(id);
      if (success) {
        markDecisionExecuted(id);
        addToast({
          type: 'success',
          title: 'Contract Executed',
          message: 'The contract has been executed successfully.',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Execution Failed',
        message: 'Could not execute the contract action.',
      });
    }
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

  const handleStartHiring = async (id: string) => {
    try {
      const success = await startHiring(id);
      if (success) {
        setHiringRequests(prev => prev.filter(h => h.id !== id));
        addToast({
          type: 'success',
          title: 'Hiring Process Started',
          message: 'Recruitment process tracking record created.',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Init Failed',
        message: 'Could not start the hiring process.',
      });
    }
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

      <ClarificationModal
        isOpen={isClarifyModalOpen}
        onClose={() => setIsClarifyModalOpen(false)}
        onConfirm={handleConfirmClarification}
        decisionTitle={selectedDecision?.details || 'Selected Decision'}
        isLoading={isSubmitLoading}
      />
    </div>
  );
}
