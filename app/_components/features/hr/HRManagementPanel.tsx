"use client";
import { useState } from 'react';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertTriangle,
  Calendar,
  FileText,
  UserPlus,
  Shield,
  ChevronRight,
  MessageSquare,
  Zap,
  Info,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useFeedbackToast } from '../../../context/ToastContext';

interface GMDecision {
  id: string;
  type: 'extend-contract' | 'terminate-contract' | 'hire-resource';
  projectName: string;
  affectedEmployees: string[];
  deadline: string;
  submittedDate: string;
  status: 'pending' | 'executed' | 'clarification-requested';
  details: string;
}

interface ContractAction {
  id: string;
  employeeName: string;
  employeeAvatar: string;
  currentContractEnd: string;
  assignedProject: string;
  action: 'extend' | 'terminate';
  gmDecisionId: string;
  status: 'pending' | 'executed';
}

interface HiringRequest {
  id: string;
  role: string;
  quantity: number;
  skillRequirements: string[];
  projectName: string;
  gmDecisionId: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface EmployeeStatus {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'assigned' | 'blocked';
  currentProjects: string[];
  assignedHours: number; // Daily working hours assigned
}

interface AssignmentRequest {
  id: string;
  projectName: string;
  employeeName: string;
  employeeAvatar: string;
  role: string;
  startDate: string;
  endDate: string;
  allocation: number;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  conflictWarning?: string;
}

const mockGMDecisions: GMDecision[] = [
  {
    id: 'gm-dec-1',
    type: 'extend-contract',
    projectName: 'Website Redesign',
    affectedEmployees: ['David Lee', 'Sarah Chen'],
    deadline: '2026-04-15',
    submittedDate: '2026-04-07',
    status: 'pending',
    details: 'Extend contracts for 6 months to complete project Phase 2',
  },
  {
    id: 'gm-dec-2',
    type: 'hire-resource',
    projectName: 'Mobile App Development',
    affectedEmployees: [],
    deadline: '2026-04-20',
    submittedDate: '2026-04-06',
    status: 'pending',
    details: 'Hire 2 Backend Developers (Senior level) - Skills: Node.js, PostgreSQL, AWS',
  },
];

const mockContractActions: ContractAction[] = [
  {
    id: 'contract-1',
    employeeName: 'David Lee',
    employeeAvatar: 'DL',
    currentContractEnd: '2026-05-15',
    assignedProject: 'Website Redesign',
    action: 'extend',
    gmDecisionId: 'gm-dec-1',
    status: 'pending',
  },
  {
    id: 'contract-2',
    employeeName: 'Sarah Chen',
    employeeAvatar: 'SC',
    currentContractEnd: '2026-06-01',
    assignedProject: 'Website Redesign',
    action: 'extend',
    gmDecisionId: 'gm-dec-1',
    status: 'pending',
  },
];

const mockHiringRequests: HiringRequest[] = [
  {
    id: 'hire-1',
    role: 'Backend Developer',
    quantity: 2,
    skillRequirements: ['Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    projectName: 'Mobile App Development',
    gmDecisionId: 'gm-dec-2',
    status: 'pending',
  },
];

const mockEmployeeStatus: EmployeeStatus[] = [
  {
    id: 'emp-1',
    name: 'David Lee',
    avatar: 'DL',
    status: 'assigned',
    currentProjects: ['Website Redesign'],
    assignedHours: 8,
  },
  {
    id: 'emp-2',
    name: 'Sarah Chen',
    avatar: 'SC',
    status: 'assigned',
    currentProjects: ['Website Redesign', 'Marketing Campaign'],
    assignedHours: 6.4,
  },
  {
    id: 'emp-3',
    name: 'Emily Wilson',
    avatar: 'EW',
    status: 'available',
    currentProjects: [],
    assignedHours: 2,
  },
  {
    id: 'emp-4',
    name: 'Michael Brown',
    avatar: 'MB',
    status: 'blocked',
    currentProjects: ['Mobile App Development'],
    assignedHours: 8.8,
  },
  {
    id: 'emp-5',
    name: 'Alex Rivera',
    avatar: 'AR',
    status: 'available',
    currentProjects: [],
    assignedHours: 0,
  },
  {
    id: 'emp-6',
    name: 'Lisa Anderson',
    avatar: 'LA',
    status: 'assigned',
    currentProjects: ['Q3 Campaign'],
    assignedHours: 4.4,
  },
  {
    id: 'emp-7',
    name: 'Tom Wilson',
    avatar: 'TW',
    status: 'assigned',
    currentProjects: ['Website Redesign', 'Mobile App'],
    assignedHours: 7.6,
  },
];

const mockAssignmentRequests: AssignmentRequest[] = [
  {
    id: 'assign-1',
    projectName: 'Marketing Campaign Q3',
    employeeName: 'Emily Wilson',
    employeeAvatar: 'EW',
    role: 'Frontend Developer',
    startDate: '2026-05-01',
    endDate: '2026-08-30',
    allocation: 80,
    requestedBy: 'John Doe (GM)',
    status: 'pending',
  },
];

export function HRManagementPanel() {
  const { addToast } = useFeedbackToast();
  const [gmDecisions, setGmDecisions] = useState<GMDecision[]>(mockGMDecisions);
  const [contractActions, setContractActions] = useState<ContractAction[]>(mockContractActions);
  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>(mockHiringRequests);
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus[]>(mockEmployeeStatus);
  const [assignmentRequests, setAssignmentRequests] = useState<AssignmentRequest[]>(
    mockAssignmentRequests
  );

  const getDecisionTypeLabel = (type: string) => {
    switch (type) {
      case 'extend-contract':
        return 'Extend Contract';
      case 'terminate-contract':
        return 'Terminate Contract';
      case 'hire-resource':
        return 'Hire New Resource';
      default:
        return type;
    }
  };

  const getDecisionTypeColor = (type: string) => {
    switch (type) {
      case 'extend-contract':
        return 'bg-green-100 text-green-700';
      case 'terminate-contract':
        return 'bg-red-100 text-red-700';
      case 'hire-resource':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700';
      case 'busy':
        return 'bg-orange-100 text-orange-700';
      case 'overloaded':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper function to calculate workload percentage from assigned hours
  const calculateWorkloadFromHours = (assignedHours: number): number => {
    return (assignedHours / 8) * 100;
  };

  // Calculate status based on assigned hours
  const calculateStatus = (assignedHours: number): 'available' | 'moderate' | 'busy' | 'overloaded' => {
    const workloadPercent = calculateWorkloadFromHours(assignedHours);
    if (workloadPercent <= 40) return 'available';
    if (workloadPercent <= 70) return 'moderate';
    if (workloadPercent <= 100) return 'busy';
    return 'overloaded';
  };

  const handleExecuteDecision = (decisionId: string) => {
    setGmDecisions((prev) =>
      prev.map((d) => (d.id === decisionId ? { ...d, status: 'executed' } : d))
    );
    addToast({
      type: 'success',
      title: 'GM Decision Executed',
      message: 'The decision has been successfully executed',
    });
  };

  const handleRequestClarification = (decisionId: string) => {
    setGmDecisions((prev) =>
      prev.map((d) => (d.id === decisionId ? { ...d, status: 'clarification-requested' } : d))
    );
    addToast({
      type: 'info',
      title: 'Clarification Requested',
      message: 'GM will be notified of your request',
    });
  };

  const handleExecuteContract = (contractId: string) => {
    setContractActions((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, status: 'executed' } : c))
    );
    addToast({
      type: 'success',
      title: 'Contract Action Executed',
      message: 'Contract has been updated successfully',
    });
  };

  const handleStartHiring = (hiringId: string) => {
    setHiringRequests((prev) =>
      prev.map((h) => (h.id === hiringId ? { ...h, status: 'in-progress' } : h))
    );
    addToast({
      type: 'success',
      title: 'Hiring Process Started',
      message: 'Recruitment workflow has been initiated',
    });
  };

  const handleApproveAssignment = (assignmentId: string) => {
    const assignment = assignmentRequests.find((a) => a.id === assignmentId);
    if (assignment) {
      setAssignmentRequests((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, status: 'approved' } : a))
      );
      setEmployeeStatus((prev) =>
        prev.map((e) =>
          e.name === assignment.employeeName
            ? {
              ...e,
              status: 'assigned' as const,
              assignedHours: e.assignedHours + (assignment.allocation / 100) * 8
            }
            : e
        )
      );
      addToast({
        type: 'success',
        title: 'Assignment Approved',
        message: `${assignment.employeeName} has been assigned to ${assignment.projectName}`,
      });
    }
  };

  const handleRejectAssignment = (assignmentId: string) => {
    setAssignmentRequests((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, status: 'rejected' } : a))
    );
    addToast({
      type: 'info',
      title: 'Assignment Rejected',
      message: 'The assignment request has been rejected',
    });
  };

  const pendingGMDecisions = gmDecisions.filter((d) => d.status === 'pending').length;
  const pendingAssignments = assignmentRequests.filter((a) => a.status === 'pending').length;

  // Calculate workload-based status counts using assigned hours
  const availableCount = employeeStatus.filter((e) => calculateStatus(e.assignedHours) === 'available').length;
  const moderateCount = employeeStatus.filter((e) => calculateStatus(e.assignedHours) === 'moderate').length;
  const busyCount = employeeStatus.filter((e) => calculateStatus(e.assignedHours) === 'busy').length;
  const overloadedCount = employeeStatus.filter((e) => calculateStatus(e.assignedHours) === 'overloaded').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold mb-1">HR Management Panel</h1>
            <p className="text-blue-100">Execute GM decisions and manage employee lifecycle</p>
          </div>
          {(pendingGMDecisions > 0 || pendingAssignments > 0) && (
            <div className="flex gap-2">
              {pendingGMDecisions > 0 && (
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
                  {pendingGMDecisions} GM Decision{pendingGMDecisions !== 1 ? 's' : ''}
                </span>
              )}
              {pendingAssignments > 0 && (
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
                  {pendingAssignments} Assignment{pendingAssignments !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Workload Status Indicator Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Workload Status Indicator</h2>
          <p className="text-sm text-gray-600">Understanding resource capacity and availability</p>
        </div>

        {/* Horizontal Legend Bar with Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Available */}
          <div className="group relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4 hover:shadow-md transition-all cursor-help">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-green-900">Available</h3>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-green-800">Workload: 0% – 40%</p>
              <p className="text-xs font-semibold text-green-800">Hours: 0 – 3.2h</p>
            </div>
            <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg mx-2">
              Resource has low workload and is available for assignment
            </div>
          </div>

          {/* Moderate */}
          <div className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-4 hover:shadow-md transition-all cursor-help">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-yellow-900">Moderate</h3>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-yellow-800">Workload: 41% – 70%</p>
              <p className="text-xs font-semibold text-yellow-800">Hours: 3.3 – 5.6h</p>
            </div>
            <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg mx-2">
              Resource has moderate workload and can still take tasks
            </div>
          </div>

          {/* Busy */}
          <div className="group relative bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-4 hover:shadow-md transition-all cursor-help">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-orange-900">Busy</h3>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-orange-800">Workload: 71% – 100%</p>
              <p className="text-xs font-semibold text-orange-800">Hours: 5.7 – 8h</p>
            </div>
            <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg mx-2">
              Resource is near full capacity
            </div>
          </div>

          {/* Overloaded */}
          <div className="group relative bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-lg p-4 hover:shadow-md transition-all cursor-help">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-red-900">Overloaded</h3>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-800">Workload: &gt; 100%</p>
              <p className="text-xs font-semibold text-red-800">Hours: &gt; 8h</p>
            </div>
            <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg mx-2">
              Resource is assigned more than daily capacity (over 8 hours/day)
            </div>
          </div>
        </div>

        {/* Capacity Note */}
        <div className="flex items-center justify-center gap-2 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-semibold text-blue-900">
            1 working day = 8 hours = 100% workload
          </p>
        </div>

        {/* Visual Bar Indicator */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-700 text-center">Workload Scale</p>
          <div className="relative">
            <div className="flex h-8 rounded-lg overflow-hidden shadow-inner border-2 border-gray-300">
              <div className="flex-[40] bg-gradient-to-r from-green-400 to-green-500"></div>
              <div className="flex-[30] bg-gradient-to-r from-yellow-400 to-yellow-500"></div>
              <div className="flex-[30] bg-gradient-to-r from-orange-400 to-orange-500"></div>
              <div className="w-12 bg-gradient-to-r from-red-500 to-red-600"></div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-semibold text-gray-700">
              <span className="text-green-700">0%</span>
              <span className="text-yellow-700" style={{ marginLeft: '-10px' }}>40%</span>
              <span className="text-orange-700" style={{ marginLeft: '-10px' }}>70%</span>
              <span className="text-red-700" style={{ marginLeft: '-15px' }}>100%</span>
              <span className="text-red-800">&gt;100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Status KPI Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Current Resource Status</h2>
          <p className="text-xs text-gray-500">Live counts by workload category</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Available */}
          <div className="bg-white rounded-lg border-2 border-green-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                  Resource with workload below 40% (0-3.2 hours/day). Ready for new assignments.
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{availableCount}</div>
            <div className="text-sm font-medium text-green-700">Available</div>
            <div className="text-xs text-gray-500 mt-1">0–40% (0–3.2h)</div>
          </div>

          {/* Moderate */}
          <div className="bg-white rounded-lg border-2 border-yellow-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                  Resource with moderate workload 41-70% (3.2-5.6 hours/day). Can handle small additional tasks.
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{moderateCount}</div>
            <div className="text-sm font-medium text-yellow-700">Moderate</div>
            <div className="text-xs text-gray-500 mt-1">41–70% (3.2–5.6h)</div>
          </div>

          {/* Busy */}
          <div className="bg-white rounded-lg border-2 border-orange-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                  Resource with high workload 71-100% (5.6-8 hours/day). At capacity, avoid new assignments.
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{busyCount}</div>
            <div className="text-sm font-medium text-orange-700">Busy</div>
            <div className="text-xs text-gray-500 mt-1">71–100% (5.6–8h)</div>
          </div>

          {/* Overloaded */}
          <div className="bg-white rounded-lg border-2 border-red-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                  Resource assigned above daily capacity (&gt;100%, more than 8 hours/day). Immediate action required to rebalance.
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{overloadedCount}</div>
            <div className="text-sm font-medium text-red-700">Overloaded</div>
            <div className="text-xs text-gray-500 mt-1">&gt;100% (&gt;8h)</div>
          </div>
        </div>
      </div>

      {/* A. GM DECISION INBOX */}
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
          {gmDecisions.filter((d) => d.status === 'pending').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No pending GM decisions</p>
            </div>
          ) : (
            gmDecisions
              .filter((d) => d.status === 'pending')
              .map((decision) => (
                <div
                  key={decision.id}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200"
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
                      onClick={() => handleExecuteDecision(decision.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Execute
                    </button>
                    <button
                      onClick={() => handleRequestClarification(decision.id)}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* B. CONTRACT EXECUTION PANEL */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700" />
              <h2 className="text-sm font-semibold text-gray-900">Contract Execution Panel</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Based on GM Decision</p>
          </div>

          <div className="p-6 space-y-3">
            {contractActions.filter((c) => c.status === 'pending').length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">No pending contract actions</p>
              </div>
            ) : (
              contractActions
                .filter((c) => c.status === 'pending')
                .map((contract) => (
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
                      onClick={() => handleExecuteContract(contract.id)}
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

        {/* C. HIRING ACTION PANEL */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-gray-700" />
              <h2 className="text-sm font-semibold text-gray-900">Hiring Action Panel</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Triggered by GM Decision</p>
          </div>

          <div className="p-6 space-y-3">
            {hiringRequests.filter((h) => h.status === 'pending').length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <UserPlus className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">No pending hiring requests</p>
              </div>
            ) : (
              hiringRequests
                .filter((h) => h.status === 'pending')
                .map((hiring) => (
                  <div
                    key={hiring.id}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{hiring.role}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          Quantity: {hiring.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Project: {hiring.projectName}</p>
                    </div>

                    <div className="mb-4 p-3 bg-white rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Required Skills:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {hiring.skillRequirements.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartHiring(hiring.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <UserPlus className="w-4 h-4" />
                      Start Hiring Process
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* D. EMPLOYEE STATUS CONTROL */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-700" />
            <h2 className="text-sm font-semibold text-gray-900">Employee Status Control</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Auto-blocked when assigned | Control assignment availability
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Table Header Info */}
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs font-medium text-blue-900">
              Workload is calculated based on 8 working hours per day (100% capacity)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Employee
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-800 uppercase tracking-wide group cursor-help relative">
                    Status
                    <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg normal-case font-normal">
                      Auto-calculated based on assigned working hours vs daily capacity
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Current Projects
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-800 uppercase tracking-wide group cursor-help relative">
                    Working Hours
                    <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg normal-case font-normal">
                      Assigned hours per day / Daily capacity (8 hours)
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-800 uppercase tracking-wide group cursor-help relative">
                    Workload %
                    <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg normal-case font-normal">
                      Calculated from assigned hours vs daily capacity (8h). Formula: (Assigned Hours / 8) × 100
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {employeeStatus.map((employee) => {
                  const calculatedStatus = calculateStatus(employee.assignedHours);
                  const workloadPercent = calculateWorkloadFromHours(employee.assignedHours);
                  const isOverloaded = workloadPercent > 100;

                  return (
                    <tr
                      key={employee.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${isOverloaded ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                        }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {employee.avatar}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900 block">{employee.name}</span>
                            {isOverloaded && (
                              <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="w-3 h-3" />
                                Over Capacity
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="group relative inline-block cursor-help">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(
                              calculatedStatus
                            )}`}
                          >
                            {calculatedStatus.toUpperCase()}
                          </span>
                          <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg">
                            {calculatedStatus === 'available' && 'Resource has low workload and is available for assignment'}
                            {calculatedStatus === 'moderate' && 'Resource has moderate workload and can still take tasks'}
                            {calculatedStatus === 'busy' && 'Resource is near full capacity'}
                            {calculatedStatus === 'overloaded' && 'Assigned working hours exceed 8 hours/day. Immediate action required.'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {employee.currentProjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {employee.currentProjects.map((project, idx) => (
                              <span
                                key={idx}
                                className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
                              >
                                {project}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="group relative inline-block cursor-help">
                          <span className={`text-sm font-bold ${isOverloaded
                            ? 'text-red-600'
                            : workloadPercent > 70
                              ? 'text-orange-600'
                              : workloadPercent > 40
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                            {employee.assignedHours}h / 8h
                          </span>
                          {isOverloaded && (
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                              +{(employee.assignedHours - 8).toFixed(1)}h over
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="group relative flex-1">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden relative">
                                <div
                                  className={`h-full rounded-full ${workloadPercent > 100
                                    ? 'bg-red-500'
                                    : workloadPercent > 70
                                      ? 'bg-orange-500'
                                      : workloadPercent > 40
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                    }`}
                                  style={{ width: `${Math.min(workloadPercent, 100)}%` }}
                                ></div>
                                {workloadPercent > 100 && (
                                  <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-pulse"></div>
                                )}
                              </div>
                              <span className={`text-sm font-bold whitespace-nowrap ${workloadPercent > 100
                                ? 'text-red-600'
                                : workloadPercent > 70
                                  ? 'text-orange-600'
                                  : workloadPercent > 40
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                                }`}>
                                {Math.round(workloadPercent)}%
                              </span>
                            </div>
                            <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg">
                              Workload: {Math.round(workloadPercent)}% = ({employee.assignedHours}h / 8h) × 100
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* E. ASSIGNMENT VALIDATION */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-700" />
            <h2 className="text-sm font-semibold text-gray-900">Assignment Validation</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">Review and approve assignment requests</p>
        </div>

        <div className="p-6 space-y-4">
          {assignmentRequests.filter((a) => a.status === 'pending').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No pending assignment requests</p>
            </div>
          ) : (
            assignmentRequests
              .filter((a) => a.status === 'pending')
              .map((assignment) => (
                <div
                  key={assignment.id}
                  className={`rounded-lg p-5 border-2 ${assignment.conflictWarning
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium">{assignment.employeeAvatar}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {assignment.projectName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {assignment.employeeName} • {assignment.role}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {assignment.allocation}% allocation
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {assignment.startDate} - {assignment.endDate}
                          </span>
                        </div>
                        <span>•</span>
                        <span>Requested by: {assignment.requestedBy}</span>
                      </div>

                      {assignment.conflictWarning && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-100 border border-yellow-300 rounded-lg mb-3">
                          <AlertTriangle className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-yellow-900">
                              Conflict Warning
                            </p>
                            <p className="text-xs text-yellow-800 mt-0.5">
                              {assignment.conflictWarning}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApproveAssignment(assignment.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectAssignment(assignment.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
