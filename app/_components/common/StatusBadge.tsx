'use client';

import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { ProjectStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus;
  showLabel?: boolean;
}

export function StatusBadge({ status, showLabel = true }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return { icon: Clock, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' };
      case 'submitted':
        return { icon: Clock, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Submitted' };
      case 'approved':
        return { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' };
      case 'rejected':
        return { icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' };
      case 'assigned':
        return { icon: CheckCircle, bg: 'bg-purple-100', text: 'text-purple-700', label: 'Assigned' };
      case 'in-progress':
        return { icon: Clock, bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' };
      case 'completed':
        return { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' };
      case 'cancelled':
        return { icon: XCircle, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' };
      default:
        return { icon: Clock, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {showLabel && config.label}
    </span>
  );
}
