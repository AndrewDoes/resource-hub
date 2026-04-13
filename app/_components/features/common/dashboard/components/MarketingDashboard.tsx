'use client';

import { 
  FileText, 
  Clock, 
  XCircle 
} from 'lucide-react';
import Link from 'next/link';
// import { marketingProjects } from '@/app/_components/features/common/dashboard/data';
import { ProjectStatus } from '@/app/types';
import React, { useState, useEffect } from 'react';
import { StatusBadge } from '@/app/_components/system/components/StatusBadge';
import { ProjectList } from '@/app/_components/features/marketing/project-revision/ProjectList';


export function MarketingDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/gateway/api/projects/list?pageNumber=${currentPage}&pageSize=5`, {
          headers: {
            'X-Debug-Role': 'marketing',
            'X-Debug-User': 'marketing-user'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        // Fallback for mapping the API fields to the fields expected by the UI.
        const mappedProjects = (data.projects || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status as ProjectStatus,
          lastModified: p.startDate ? `Started ${p.startDate}` : 'Unknown', // Fallback since API lacks lastModified
          feedback: null // Fallback since API lacks feedback field for now
        }));
        
        setProjects(mappedProjects);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [currentPage]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Marketing Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your project proposals</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          Error loading projects: {error}
        </div>
      )}

      {isLoading && !error && (
        <div className="p-4 text-center text-gray-500 text-sm">
          Loading dashboard data...
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/marketing/projects" className="bg-linear-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
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
            {projects.filter(p => p.status === 'submitted').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Awaiting GM approval</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">Needs Revision</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {projects.filter(p => p.status === 'rejected').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Requires updates</p>
        </div>
      </div>

      {/* My Projects */}
      <ProjectList 
        projects={projects} 
        isLoading={isLoading} 
        error={error} 
        title="My Projects"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
