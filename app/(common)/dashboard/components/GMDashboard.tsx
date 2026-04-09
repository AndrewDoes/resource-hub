'use client';

import { 
  AlertTriangle, 
  Folder, 
  Users 
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';
import { gmPendingActions, gmResourceConflicts, utilizationData } from '../data';


export function GMDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">General Manager Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Critical actions and resource overview</p>
      </div>

      {/* Priority Actions */}
      <div className="bg-linear-to-br from-red-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-1">Immediate Action Required</h2>
            <p className="text-red-50 text-sm mb-4">
              {gmPendingActions.filter(a => a.priority === 'high').length} high-priority items need your attention
            </p>
            <div className="space-y-2">
              {gmPendingActions.filter(a => a.priority === 'high').map((action) => (
                <div key={action.id} className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{action.title}</p>
                    <span className="text-xs bg-white/30 px-2 py-1 rounded">{action.daysWaiting}d waiting</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Conflicts */}
      <div className="bg-white rounded-xl border-2 border-red-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Resource Conflicts Detected</h2>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {gmResourceConflicts.map((conflict, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="font-semibold text-gray-900">{conflict.employee}</p>
                <p className="text-sm text-gray-600">{conflict.projects} overlapping projects</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-red-600">{conflict.allocation}%</p>
                <p className="text-xs text-red-600 font-medium uppercase">{conflict.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/planning" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Folder className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Planning</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">
            {gmPendingActions.filter(a => a.type === 'approval').length}
          </p>
          <p className="text-sm text-gray-500">Projects awaiting approval</p>
        </Link>

        <Link href="/decision-panel" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Contract Decisions</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">
            {gmPendingActions.filter(a => a.type === 'contract').length}
          </p>
          <p className="text-sm text-gray-500">Contracts pending decision</p>
        </Link>

        <Link href="/resource-overview" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Resource Overview</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">
            {gmResourceConflicts.length}
          </p>
          <p className="text-sm text-gray-500">View-only resource status</p>
        </Link>
      </div>

      {/* Utilization Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={utilizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="utilization" stroke="#3B82F6" strokeWidth={2} name="Utilization %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
