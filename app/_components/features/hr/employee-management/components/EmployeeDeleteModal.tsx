'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employee: Employee | null;
}

export function EmployeeDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  employee,
}: EmployeeDeleteModalProps) {
  if (!isOpen || !employee) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Remove Employee</h3>
            <p className="text-sm text-gray-600 mt-1">
              Are you sure you want to remove <strong>{employee.name}</strong> from the system? This action cannot be undone.
            </p>
          </div>
        </div>

        {employee.currentProjects.length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-sm text-orange-700">
              Note: This employee is currently assigned to {employee.currentProjects.length} projects.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Remove Employee
          </button>
        </div>
      </div>
    </>
  );
}
