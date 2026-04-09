'use client';

import { Mail, Briefcase, ChevronRight, Edit2, Trash2, Award } from 'lucide-react';
import { Employee } from '../types';
import { getAvailabilityStatus } from '../utils';

interface EmployeeTableProps {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeTable({ employees, onSelect, onEdit, onDelete }: EmployeeTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Role & Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Workload
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Projects
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((employee) => {
              const availStatus = getAvailabilityStatus(
                employee.availability,
                employee.workload
              );
              const isOverloaded = employee.workload > 100;

              return (
                <tr
                  key={employee.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${isOverloaded ? 'bg-red-50/30' : ''
                    }`}
                  onClick={() => onSelect(employee)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white font-medium text-sm">
                          {employee.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{employee.role}</p>
                    <p className="text-xs text-gray-500">{employee.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {employee.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {employee.skills.length > 3 && (
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          +{employee.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.availability}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${employee.workload <= 80
                            ? 'bg-green-500'
                            : employee.workload <= 100
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                            }`}
                          style={{ width: `${Math.min(employee.workload, 100)}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-sm font-medium w-12 ${isOverloaded ? 'text-red-600' : 'text-gray-900'
                          }`}
                      >
                        {employee.workload}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {employee.currentProjects.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-900">
                          {employee.currentProjects.length} active
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No assignments</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${availStatus.color === 'green'
                          ? 'bg-green-100 text-green-700'
                          : availStatus.color === 'yellow'
                            ? 'bg-yellow-100 text-yellow-700'
                            : availStatus.color === 'orange'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${availStatus.color === 'green'
                            ? 'bg-green-500'
                            : availStatus.color === 'yellow'
                              ? 'bg-yellow-500'
                              : availStatus.color === 'orange'
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                            }`}
                        ></span>
                        {availStatus.label}
                      </span>
                      {employee.status !== 'active' && (
                        <div>
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {employee.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(employee);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Employee"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(employee);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(employee);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No employees found</p>
          <p className="text-xs text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
