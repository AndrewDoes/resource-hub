'use client';

import { 
  FileText, 
  Clock, 
  XCircle, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import { marketingProjects } from '../../../data/dashboard';
import { StatusBadge } from '../../common/StatusBadge';

export function MarketingDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Marketing Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your project proposals</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/projects" className="bg-linear-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-6 h-6" />
            <h3 className="font-semibold text-lg">Create New Project</h3>
          </div>
          <p className="text-sm text-purple-50">Submit a new project proposal</p>
        </Link>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Pending Review</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {marketingProjects.filter(p => p.status === 'submitted').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Awaiting GM approval</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">Needs Revision</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {marketingProjects.filter(p => p.status === 'rejected').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Requires updates</p>
        </div>
      </div>

      {/* My Projects */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Projects</h2>
        </div>
        <div className="p-6 space-y-3">
          {marketingProjects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-gray-500">Last modified: {project.lastModified}</p>
                {project.feedback && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <span className="font-medium">Feedback:</span> {project.feedback}
                  </div>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
