'use client';

import { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  History,
  Info
} from 'lucide-react';
import {
  fetchEmployeeDashboard,
  acceptAssignment,
  type EmployeeDashboardData,
  type EmployeeDashboardAssignment,
  type EmployeeDashboardTask
} from '@/functions/api/employeeDashboard';
import { useRole } from '@/app/context/RoleContext';
import { StatusBadge } from '@/app/_components/system/components/StatusBadge';
import { useFeedbackToast } from '@/app/context/ToastContext';
import { ProjectStatus } from '@/app/_components/system/types';

const mapAssignmentStatus = (status: string): ProjectStatus => {
  const s = status.toLowerCase();
  switch (s) {
    case 'pending': return 'submitted';
    case 'gmapproved': return 'under-review';
    case 'approved': return 'approved';
    case 'accepted': return 'assigned';
    case 'inprogress':
    case 'in-progress': return 'in-progress';
    case 'rejected': return 'rejected';
    default: return 'submitted';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': return 'text-red-600 bg-red-50 border-red-100';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-100';
    default: return 'text-gray-600 bg-gray-50 border-gray-100';
  }
};

export function EmployeeDashboardView() {
  const { currentUser } = useRole();
  const { addToast } = useFeedbackToast();
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const loadDashboard = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const result = await fetchEmployeeDashboard(currentUser.id);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id && currentUser?.role === 'employee') {
      loadDashboard();
    }
  }, [currentUser?.id, currentUser?.role]);

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAccept = async (assignmentId: string) => {
    try {
      const success = await acceptAssignment(assignmentId);
      if (success) {
        addToast({
          type: 'success',
          title: 'Assignment Accepted',
          message: 'You have joined the project successfully.',
        });
        loadDashboard();
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not accept the assignment.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Loading your assignments...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-900 font-semibold">{error || 'Something went wrong'}</p>
        <button
          onClick={() => loadDashboard()}
          className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Employee Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Hello, {currentUser?.name}! Here's a detailed view of your current engagements.</p>
      </div>

      {/* Assignment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-orange-500 to-yellow-500 rounded-xl p-6 text-white shadow-lg border border-orange-400/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">Pending Invitations</h3>
          </div>
          <p className="text-4xl font-bold mb-1">
            {data.pendingAssignmentsCount}
          </p>
          <p className="text-orange-50 text-sm font-medium opacity-90">Awaiting your response</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle className="w-24 h-24 text-green-600" />
          </div>
          <div className="flex items-center gap-3 mb-3 relative">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Active Engagements</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-1 relative">
            {data.activeProjectsCount}
          </p>
          <p className="text-sm text-gray-500 font-medium relative">Currently contributing to</p>
        </div>
      </div>

      {/* My Assignments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">My Assignments</h2>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">
            {data.assignments.length} Projects
          </span>
        </div>

        {data.assignments.length === 0 ? (
          <div className="py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Info className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No assigned projects or invitations at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {data.assignments.map((assignment) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment} 
                isExpanded={expandedCards[assignment.id]}
                onToggle={() => toggleCard(assignment.id)}
                onAccept={() => handleAccept(assignment.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AssignmentCard({ 
  assignment, 
  isExpanded, 
  onToggle,
  onAccept 
}: { 
  assignment: EmployeeDashboardAssignment, 
  isExpanded: boolean,
  onToggle: () => void,
  onAccept: () => void
}) {
  const statusLower = assignment.status.toLowerCase();
  const isPending = statusLower === 'pending' || statusLower === 'gmapproved' || statusLower === 'approved';

  // Task filtering
  const inProgressTasks = assignment.tasks.filter(t => t.status.toLowerCase() === 'inprogress');
  const otherTasks = assignment.tasks.filter(t => t.status.toLowerCase() !== 'inprogress');

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-2 ring-orange-500/20 border-orange-200 shadow-lg' : 'border-gray-200 hover:border-orange-300 hover:shadow-md shadow-sm'}`}>
      {/* Header Summary */}
      <div 
        className="p-6 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">{assignment.projectName}</h3>
              <StatusBadge status={mapAssignmentStatus(assignment.status)} />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-gray-700">{assignment.roleName}</span>
              </div>
              <div className="h-1 w-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Colleagues: <span className="font-medium text-gray-700">{assignment.teamMembers.length}</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Progress</p>
                <div className="flex items-center gap-2">
                   <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
                      <div className="bg-green-500 h-full transition-all duration-700" style={{ width: `${assignment.projectProgressPercent}%` }} />
                   </div>
                   <span className="text-sm font-bold text-gray-900 leading-none">{assignment.projectProgressPercent}%</span>
                </div>
             </div>

             <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-orange-50 transition-colors">
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
             </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] border-t border-gray-100 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-6 space-y-8 bg-gray-50/30">
          
          {/* Project Ecosystem Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Project Details & PM */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  Project Overview
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {assignment.projectDescription || "No detailed description provided for this project."}
                </p>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">Project Manager</p>
                    <p className="text-sm font-semibold text-blue-900">{assignment.projectManagerName}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  My Teammates
                </h4>
                {assignment.teamMembers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No other team members assigned yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {assignment.teamMembers.map((member, i) => (
                      <div key={i} className="group relative">
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gray-100 to-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-all cursor-help">
                          {member.fullName.charAt(0)}
                        </div>
                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 pointer-events-none">
                          <div className="bg-gray-900 text-white p-3.5 rounded-xl text-xs w-52 shadow-2xl border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold">
                                {member.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-sm leading-none">{member.fullName}</p>
                                <p className="text-gray-400 font-medium text-[10px] mt-0.5">{member.jobTitle}</p>
                              </div>
                            </div>
                            <div className="h-px bg-white/10 my-2" />
                            <div className="flex items-center justify-between">
                               <span className="text-gray-500 font-bold uppercase tracking-tighter text-[9px]">Assignment Role</span>
                               <span className="text-orange-400 font-bold uppercase tracking-widest text-[9px]">{member.roleName}</span>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Timeline & Milestones */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Target className="w-3 h-3" />
                  Milestones & Timeline
                </h4>
                
                <div className="relative pt-8 pb-12 px-6">
                  {/* The Line */}
                  <div className="absolute left-0 right-0 h-1 bg-gray-100 rounded-full" />
                  
                  {/* Start/End Markers */}
                  <div className="absolute left-0 -translate-x-1/2 -top-1 px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[9px] font-bold uppercase">
                    Start: {assignment.startDate}
                  </div>
                  <div className="absolute right-0 translate-x-1/2 -top-1 px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[9px] font-bold uppercase">
                    End: {assignment.endDate}
                  </div>

                  {/* Milestones Plotting */}
                  {assignment.milestones.map((milestone, idx) => {
                    // Logic to position dots based on date would be here, 
                    // using percentage of project duration. For now, even spacing for visuality.
                    const pos = (idx + 1) * (100 / (assignment.milestones.length + 1));
                    return (
                      <div 
                        key={milestone.milestoneId} 
                        className="absolute group"
                        style={{ left: `${pos}%` }}
                      >
                        <div className={`w-4 h-4 -translate-x-1/2 -translate-y-1.5 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-125 z-10 cursor-help ${milestone.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                        
                        {/* Label */}
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                          <p className={`text-[10px] font-bold tracking-tight mb-0.5 ${milestone.isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                            {milestone.title}
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium">{milestone.dueDate}</p>
                        </div>

                        {/* Hover Detail */}
                        {milestone.description && (
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block transition-all z-30">
                             <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-xl w-48 text-xs text-gray-600 leading-tight">
                                {milestone.description}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                             </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {assignment.milestones.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400 italic">No milestones defined for this project's timeline.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons if Pending */}
              {isPending && (
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-bold text-orange-900 leading-tight">Project Invitation</p>
                      <p className="text-xs text-orange-700">Please review the details and accept to join the project team.</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept();
                    }}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Accept Assignment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              My Task Assignments
            </h4>
            
            <div className="space-y-4">
              {/* Active Tasks Group */}
              {inProgressTasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-orange-500 uppercase flex items-center gap-1.5 px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    In Progress
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {inProgressTasks.map(task => <TaskListItem key={task.taskId} task={task} active />)}
                  </div>
                </div>
              )}

              {/* Completed/Pending Tasks Group */}
              {otherTasks.length > 0 && (
                <div className="space-y-2 pt-2">
                   <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5 px-2">
                    <History className="w-3 h-3" />
                    Archive / Pending
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {otherTasks.map(task => <TaskListItem key={task.taskId} task={task} />)}
                  </div>
                </div>
              )}

              {assignment.tasks.length === 0 && (
                 <div className="p-10 bg-white rounded-xl border border-gray-100 text-center">
                    <p className="text-sm text-gray-400 italic">You haven't been assigned any specific tasks for this project yet.</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskListItem({ task, active }: { task: EmployeeDashboardTask, active?: boolean }) {
  const isCompleted = task.status.toLowerCase() === 'completed';

  return (
    <div className={`p-4 rounded-xl border transition-all ${active ? 'bg-white border-orange-100 shadow-sm' : 'bg-gray-50/50 border-gray-200 opacity-80 hover:opacity-100'}`}>
      <div className="flex items-start justify-between mb-2">
        <h5 className={`text-sm font-bold ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.taskName}</h5>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tight ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
        {task.description || "No description provided."}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Due: {task.dueDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isCompleted ? (
            <div className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase">
               <CheckCircle className="w-3 h-3" />
               Done
            </div>
          ) : (
            <div className="flex items-center gap-1 text-orange-600 font-bold text-[10px] uppercase leading-none">
               <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
               {task.status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
