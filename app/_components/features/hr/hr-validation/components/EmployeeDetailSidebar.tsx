'use client';

import { 
  X, Mail, Phone, MapPin, Calendar, Award, Briefcase, Edit2, Trash2 
} from 'lucide-react';
import { Employee } from '../types';

interface EmployeeDetailSidebarProps {
  employee: Employee | null;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeDetailSidebar({ 
  employee, 
  onClose, 
  onEdit, 
  onDelete 
}: EmployeeDetailSidebarProps) {
  if (!employee) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-125 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Employee Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="text-center">
            <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-semibold text-2xl">
                {employee.avatar}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{employee.role}</p>
            <p className="text-xs text-gray-500">{employee.department}</p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 uppercase">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                {employee.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {employee.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                {employee.location}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                Joined {new Date(employee.joinedDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 uppercase">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                >
                  <Award className="w-3 h-3" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Availability & Workload */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Availability</p>
              <p className="text-2xl font-semibold text-gray-900">
                {employee.availability}%
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${employee.workload > 100 ? 'bg-red-50' : 'bg-gray-50'
                }`}
            >
              <p className="text-xs text-gray-600 mb-1">Workload</p>
              <p
                className={`text-2xl font-semibold ${employee.workload > 100 ? 'text-red-600' : 'text-gray-900'
                  }`}
              >
                {employee.workload}%
              </p>
            </div>
          </div>

          {/* Current Projects */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 uppercase">
              Current Projects ({employee.currentProjects.length})
            </h4>
            {employee.currentProjects.length > 0 ? (
              <div className="space-y-2">
                {employee.currentProjects.map((project, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">{project}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No active assignments</p>
            )}
          </div>

          {/* Project History */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 uppercase">
              Project History
            </h4>
            <div className="space-y-2">
              {employee.projectHistory.map((project, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-700">{project}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onEdit(employee)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Employee
            </button>
            <button
              onClick={() => onDelete(employee)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
