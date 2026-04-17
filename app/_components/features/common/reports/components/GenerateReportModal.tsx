'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Calendar, Download, Building2, Filter, Sparkles, Loader2 } from 'lucide-react';
import { fetchDepartmentsLookup } from '@/functions/api/humanResource';
import { exportReport } from '@/functions/api/reports';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GenerateReportModal({ isOpen, onClose }: GenerateReportModalProps) {
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '0',
    startDate: '',
    endDate: '',
    departmentId: '',
  });

  useEffect(() => {
    if (isOpen) {
      const loadDepts = async () => {
        setLoading(true);
        try {
          const depts = await fetchDepartmentsLookup();
          setDepartments(depts);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadDepts();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await exportReport(
        parseInt(formData.type),
        formData.startDate || undefined,
        formData.endDate || undefined,
        formData.departmentId || undefined
      );
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Custom Report</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Analytics Engine v2.0</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Report Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              Report Type
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-50 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
            >
              <option value="0">Resource Utilization</option>
              <option value="1">Project Performance</option>
              <option value="2">Hiring Demand Forecast</option>
              <option value="3">Skills Gap Analysis</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-50 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-50 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              Department (Optional)
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-50 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-blue-500/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {generating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Download className="w-6 h-6" />
              )}
              {generating ? 'Compiling Report...' : 'Generate & Export CSV'}
            </button>
          </div>
        </form>

        <div className="px-8 pb-8 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">AI-Enhanced Data Validation Active</p>
        </div>
      </div>
    </div>
  );
}
