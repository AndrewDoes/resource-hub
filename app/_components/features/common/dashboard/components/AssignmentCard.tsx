'use client';

import { useState } from 'react';
import {
  Clock,
  CheckCircle,
  User,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  History,
  Info,
  AlertCircle,
  Calendar
} from 'lucide-react';
import {
  type EmployeeDashboardAssignment,
  type EmployeeDashboardTask
} from '@/functions/api/employeeDashboard';
import { StatusBadge } from '@/app/_components/system/components/StatusBadge';
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
    case 'completed': return 'completed';
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

interface AssignmentCardProps {
  assignment: EmployeeDashboardAssignment;
  onAccept?: () => void;
  defaultExpanded?: boolean;
}

export function AssignmentCard({
  assignment,
  onAccept,
  defaultExpanded = false
}: AssignmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const statusLower = assignment.status.toLowerCase();
  const isPending = statusLower === 'pending' || statusLower === 'gmapproved' || statusLower === 'approved';

  // Task filtering
  const inProgressTasks = (assignment.tasks || []).filter(t => t.status.toLowerCase() === 'inprogress');
  const otherTasks = (assignment.tasks || []).filter(t => t.status.toLowerCase() !== 'inprogress');

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-2 ring-orange-500/20 border-orange-200 shadow-lg' : 'border-gray-200 hover:border-orange-300 hover:shadow-md shadow-sm'}`}>
      {/* Header Summary */}
      <div
        className="p-6 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
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
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-700">{assignment.startDate} - {assignment.endDate}</span>
              </div>
              <div className="h-1 w-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Colleagues: <span className="font-medium text-gray-700">{assignment.teamMembers?.length || 0}</span></span>
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
                {!assignment.teamMembers || assignment.teamMembers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No other team members assigned yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {assignment.teamMembers.map((member, i) => (
                      <div key={i} className="group relative">
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gray-100 to-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-all cursor-help text-uppercase">
                          {member.fullName.charAt(0)}
                        </div>
                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 pointer-events-none">
                          <div className="bg-gray-900 text-white p-3.5 rounded-xl text-xs w-52 shadow-2xl border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold uppercase">
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
                  {assignment.milestones?.map((milestone, idx) => {
                    const pos = (idx + 1) * (100 / (assignment.milestones.length + 1));
                    return (
                      <div
                        key={milestone.milestoneId}
                        className="absolute group"
                        style={{ left: `${pos}%` }}
                      >
                        <div className={`w-4 h-4 -translate-x-1/2 -translate-y-1.5 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-125 z-10 cursor-help ${milestone.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />

                        {/* Label - Hidden by default, shown on group hover */}
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 pointer-events-none">
                          <p className={`text-[10px] font-bold tracking-tight mb-0.5 ${milestone.isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                            {milestone.title}
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium">{milestone.dueDate}</p>
                        </div>

                        {/* Hover Detail */}
                        {milestone.description && (
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block transition-all z-30">
                            <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-xl w-48 text-xs text-gray-600 leading-tight whitespace-normal">
                              {milestone.description}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {(!assignment.milestones || assignment.milestones.length === 0) && (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400 italic">No milestones defined for this project's timeline.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons if Pending */}
              {isPending && onAccept && (
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

              {(!assignment.tasks || assignment.tasks.length === 0) && (
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
