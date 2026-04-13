'use client';

import { X, Calendar as CalendarIcon, Briefcase, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Employee } from '../types';

interface RehireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { 
    employeeId: string, 
    jobTitle: string, 
    startDate: string, 
    endDate: string, 
    notes?: string 
  }) => void;
  employee: Employee | null;
}

export function RehireModal({ isOpen, onClose, onConfirm, employee }: RehireModalProps) {
  const [formData, setFormData] = useState({
    jobTitle: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (employee) {
      setFormData(prev => ({
        ...prev,
        jobTitle: employee.role,
      }));
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      employeeId: employee.id,
      ...formData
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-blue-50">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-blue-900">Rehire Employee</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-full transition-colors text-blue-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center gap-4 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
               {employee.avatar}
            </div>
            <div>
               <p className="font-semibold text-gray-900">{employee.name}</p>
               <p className="text-xs text-gray-500">{employee.email}</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">New Job Title</label>
            <div className="relative">
              <input
                required
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pl-10"
                placeholder="e.g. Senior Software Engineer"
              />
              <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <div className="relative">
                <input
                  required
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pl-10"
                />
                <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <div className="relative">
                <input
                  required
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pl-10"
                />
                <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 font-medium">Rehire Notes</label>
            <div className="relative">
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pl-10"
                  placeholder="Optional notes about the rehiring..."
                />
                <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md flex items-center justify-center gap-2"
            >
              Confirm Rehire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
