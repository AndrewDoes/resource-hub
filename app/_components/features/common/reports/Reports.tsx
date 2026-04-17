'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Sub-components
import { ReportGrid } from './components/ReportGrid';
import { UtilizationChart } from './components/UtilizationChart';
import { SkillsPieChart } from './components/SkillsPieChart';
import { ProjectCompletionChart } from './components/ProjectCompletionChart';

// API
import { getReportMetrics } from '@/functions/api/reports';
import { fetchDepartmentsLookup } from '@/functions/api/humanResource';

export function Reports() {
  const [metrics, setMetrics] = useState<any>(null);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getReportMetrics(selectedDeptId || undefined);
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load report data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDeptId]);

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const depts = await fetchDepartmentsLookup();
        setDepartments(depts);
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    loadDepts();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
          <Sparkles className="w-6 h-6 text-purple-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Assembling your intelligence dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-red-50 rounded-2xl border border-red-100">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Reports</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchData}
          className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Fallback to empty defaults if metrics is null
  const utilizationData = metrics?.utilizationByDept || [];
  const skillData = metrics?.skillDistribution || [];
  const completionData = metrics?.projectCompletion || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl shadow-blue-500/5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Hub</span></h1>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-gray-500 font-medium">
            Real-time insights and decision-ready reporting
          </p>
        </div>
      </div>

      {/* Available Reports */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Pre-built Reports</h2>
        <ReportGrid />
      </div>

      {/* Charts */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Visual Analytics</h2>
          
          {/* Department Filter Selector */}
          <div className="relative">
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="appearance-none w-full sm:w-64 px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-600 text-sm shadow-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Utilization by Department */}
          <div className="transition-all duration-500 hover:scale-[1.01]">
            <UtilizationChart data={utilizationData} />
          </div>

          {/* Skills Distribution */}
          <div className="transition-all duration-500 hover:scale-[1.01]">
            <SkillsPieChart data={skillData} />
          </div>

          {/* Project Completion Rate */}
          <div className="lg:col-span-2 transition-all duration-500 hover:scale-[1.005]">
            <ProjectCompletionChart data={completionData} />
          </div>
        </div>
      </div>
    </div>
  );
}
