import { Mail, Briefcase, ChevronRight, Edit2, Trash2, Award, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { Employee } from '../types';
import { getEmployeeStatus } from '../utils';

interface EmployeeTableProps {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeTable({ employees, onSelect, onEdit, onDelete }: EmployeeTableProps) {
  const weeklyBaselineHours = 40;

  const sortedEmployees = [...employees].sort((a, b) => {
    if (a.status === 'terminated' && b.status !== 'terminated') return 1;
    if (a.status !== 'terminated' && b.status === 'terminated') return -1;
    return 0;
  });

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
                Allocated Hours (Week)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Workload (%)
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
            {sortedEmployees.map((employee) => {
              const workload = Math.max(0, Math.round(employee.workload));
              const status = employee.workloadStatus;
              const isOverloaded = workload > 100;
              const isTerminated = employee.status === 'terminated';
              const weeklyHours = Math.round(employee.assignedHours * 10) / 10;

              return (
                <tr
                  key={employee.id}
                  className={`transition-colors ${isTerminated
                    ? 'bg-gray-50/50 opacity-60 grayscale cursor-pointer hover:bg-gray-100'
                    : isOverloaded
                      ? 'bg-red-50/30 border-l-4 border-l-red-500 hover:bg-red-50/50 cursor-pointer'
                      : 'hover:bg-gray-50 cursor-pointer'
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
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          <Award className="w-3 h-3" />
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
                    <div>
                      <div className={`text-sm font-semibold ${
                        weeklyHours > weeklyBaselineHours ? 'text-red-600' :
                        weeklyHours > 28 ? 'text-orange-600' :
                        weeklyHours > 16 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {weeklyHours}h / {weeklyBaselineHours}h
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Assigned / Weekly Capacity
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${employee.availability >= 80 ? 'bg-green-500' :
                            employee.availability >= 50 ? 'bg-yellow-500' :
                            employee.availability > 0 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${employee.availability}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12">
                        {employee.availability}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 w-24 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${workload > 100 ? 'bg-red-500' :
                            workload > 70 ? 'bg-orange-500' :
                            workload > 40 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(workload, 100)}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-sm font-bold whitespace-nowrap min-w-[50px] text-right ${workload > 100 ? 'text-red-600' :
                          workload > 70 ? 'text-orange-600' :
                          workload > 40 ? 'text-yellow-600' : 'text-green-600'
                        }`}
                      >
                        {workload}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {employee.currentProjects.length > 0 ? (
                      <div className="space-y-1">
                        {employee.currentProjects.map((project, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-sm">
                            <Briefcase className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="text-gray-900 truncate max-w-[120px]" title={project}>{project}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No assignments</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {isTerminated || employee.status === 'inactive' ? (
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${employee.status === 'terminated'
                          ? 'bg-gray-100 text-gray-500 border border-gray-200'
                          : 'bg-red-50/50 text-red-700 border border-red-100'
                          }`}>
                          {getEmployeeStatus(employee.status).label}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          status === 'available' ? 'bg-green-100 text-green-700' :
                          status === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                          status === 'busy' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {status === 'available' && <CheckCircle className="w-3.5 h-3.5" />}
                          {status === 'moderate' && <TrendingUp className="w-3.5 h-3.5" />}
                          {status === 'busy' && <Briefcase className="w-3.5 h-3.5" />}
                          {status === 'overloaded' && <AlertTriangle className="w-3.5 h-3.5" />}
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            status === 'available' ? 'bg-green-500' :
                            status === 'moderate' ? 'bg-yellow-500' :
                            status === 'busy' ? 'bg-orange-500' : 'bg-red-500'
                          }`}></span>
                          {status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isTerminated) onEdit(employee);
                        }}
                        disabled={isTerminated}
                        className={`p-2 rounded-lg transition-colors ${isTerminated
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        title={isTerminated ? "Cannot edit terminated employee" : "Edit Employee"}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isTerminated) onDelete(employee);
                        }}
                        disabled={isTerminated}
                        className={`p-2 rounded-lg transition-colors ${isTerminated
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                          }`}
                        title={isTerminated ? "Cannot remove terminated employee record" : "Remove Employee"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(employee);
                        }}
                        className={`p-2 rounded-lg transition-colors ${isTerminated
                          ? 'text-gray-400 hover:bg-gray-200'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
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
