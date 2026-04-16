'use client';

import { 
  Clock, 
  CheckCircle, 
  Calendar, 
  ArrowRight,
  User,
  ExternalLink,
  Target,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { 
  type EmployeeDashboardTask, 
  type EmployeeDashboardMilestone,
  type EmployeeDashboardAssignment 
} from '@/functions/api/employeeDashboard';
import { StatusBadge } from '@/app/_components/system/components/StatusBadge';

// Helper for priority colors (Dashboard version)
const getPriorityStyles = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': return 'text-red-700 bg-red-100/50 border-red-200';
    case 'medium': return 'text-yellow-700 bg-yellow-100/50 border-yellow-200';
    case 'low': return 'text-blue-700 bg-blue-100/50 border-blue-200';
    default: return 'text-gray-700 bg-gray-100/50 border-gray-200';
  }
};

/**
 * Unified Task Spotlight - Shows in-progress tasks across all projects
 */
export function UnifiedTaskList({ tasks }: { tasks: (EmployeeDashboardTask & { projectName: string })[] }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-gray-300" />
        </div>
        <p className="text-gray-900 font-semibold mb-1">Clear Horizon</p>
        <p className="text-sm text-gray-500">No active tasks assigned to you at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div 
          key={task.taskId} 
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                {task.projectName}
              </p>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{task.taskName}</h4>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tight ${getPriorityStyles(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {task.description || "Project task active and in progress."}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Due: {task.dueDate}</span>
            </div>
            <div className="flex items-center gap-1 text-orange-600 font-bold text-[10px] uppercase">
               <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
               In Progress
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Global Milestone List - Next milestones across all projects
 */
export function GlobalMilestoneList({ milestones }: { milestones: (EmployeeDashboardMilestone & { projectName: string })[] }) {
  if (milestones.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-xs text-gray-400 italic">No upcoming milestones planned.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {milestones.map((milestone) => (
        <div 
          key={milestone.milestoneId}
          className="relative pl-6 pb-4 border-l border-gray-100 last:pb-0"
        >
          <div className={`absolute left-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ring-4 ring-white ${milestone.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{milestone.projectName}</p>
            <p className="text-xs font-bold text-gray-900 leading-tight">{milestone.title}</p>
            <div className="flex items-center gap-1.5 text-gray-400">
               <Calendar className="w-3 h-3" />
               <span className="text-[9px] font-bold uppercase">{milestone.dueDate}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Compact Project Snapshot - Minimum info for dashboard view
 */
export function CompactProjectCard({ assignment }: { assignment: EmployeeDashboardAssignment }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-xs transition-all flex flex-col gap-3 group">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
            {assignment.projectName}
          </h4>
          <div className="flex items-center gap-1.5 text-gray-500">
            <User className="w-3 h-3 text-orange-400" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{assignment.roleName}</span>
          </div>
        </div>
        <Link 
          href="/employee/my-projects"
          className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          title="View full project details"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
           <span>Total Progress</span>
           <span className="text-gray-900">{assignment.projectProgressPercent}%</span>
        </div>
        <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden border border-gray-100">
           <div 
             className="bg-green-500 h-full transition-all duration-700" 
             style={{ width: `${assignment.projectProgressPercent}%` }} 
           />
        </div>
      </div>
    </div>
  );
}
