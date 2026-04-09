'use client';

import { ArrowRight } from 'lucide-react';
import { ProjectStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface StatusTransitionProps {
  from: ProjectStatus;
  to: ProjectStatus;
}

export function StatusTransition({ from, to }: StatusTransitionProps) {
  return (
    <div className="flex items-center gap-3">
      <StatusBadge status={from} />
      <ArrowRight className="w-5 h-5 text-gray-400" />
      <StatusBadge status={to} />
    </div>
  );
}
