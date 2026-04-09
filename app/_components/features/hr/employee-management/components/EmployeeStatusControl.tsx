'use client';

import { Users, AlertTriangle, TrendingUp, Briefcase, CheckCircle } from 'lucide-react';
import { calculateStatus, calculateWorkloadFromHours, getStatusColor } from '../utils';
import { EmployeeStatus } from '../types';

interface EmployeeStatusControlProps {
  employeeStatus: EmployeeStatus[];
}

export function EmployeeStatusControl({ employeeStatus }: EmployeeStatusControlProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-700" />
          <h2 className="text-sm font-semibold text-gray-900">Current Employee Status</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Current Projects
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Assigned Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Workload (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employeeStatus.map((employee) => {
              const workload = calculateWorkloadFromHours(employee.assignedHours);
              const status = calculateStatus(employee.assignedHours);
              const isOverloaded = workload > 100;

              return (
                <tr
                  key={employee.id}
                  className={`hover:bg-gray-50 transition-colors ${isOverloaded ? 'bg-red-50/30' : ''
                    }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {employee.avatar}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">{employee.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {employee.currentProjects.length > 0 ? (
                        employee.currentProjects.map((project, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {project}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No projects</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={employee.assignedHours > 8 ? 'text-red-600 font-bold' : ''}>
                      {employee.assignedHours}h
                    </span>
                    <span className="text-gray-400 ml-1">/ 8h</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${workload <= 40
                            ? 'bg-green-500'
                            : workload <= 70
                              ? 'bg-yellow-500'
                              : workload <= 100
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                            }`}
                          style={{ width: `${Math.min(workload, 100)}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-xs font-semibold ${isOverloaded ? 'text-red-600' : 'text-gray-700'
                          }`}
                      >
                        {Math.round(workload)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(
                        status
                      )}`}
                    >
                      {status === 'available' && <CheckCircle className="w-3 h-3" />}
                      {status === 'moderate' && <TrendingUp className="w-3 h-3" />}
                      {status === 'busy' && <Briefcase className="w-3 h-3" />}
                      {status === 'overloaded' && <AlertTriangle className="w-3 h-3" />}
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
