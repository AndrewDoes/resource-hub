import { Users, AlertTriangle, Briefcase } from 'lucide-react';
import { EmployeeStatus } from '../types';
import { getStatusColor } from '../utils';

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
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-400">
              <th className="px-6 py-3 text-left uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left uppercase tracking-wider">Current Projects</th>
              <th className="px-6 py-3 text-left uppercase tracking-wider">Working Hours</th>
              <th className="px-6 py-3 text-left uppercase tracking-wider">Workload %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employeeStatus.map((employee) => {
              const workload = employee.workload;
              const isOverloaded = workload > 100;
              // Calculate daily hours based on workload % and 8h baseline
              const dailyHours = (workload / 100) * 8;
              const overHours = Math.max(0, dailyHours - 8);

              return (
                <tr
                  key={employee.id}
                  className={`hover:bg-gray-50/50 transition-colors ${isOverloaded ? 'bg-red-50/40 relative' : ''}`}
                >
                  <td className="px-6 py-4">
                    {/* Active highlight bar for overloaded */}
                    {isOverloaded && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white font-medium text-sm">
                          {employee.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">{employee.name}</p>
                        {isOverloaded && (
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-red-600 font-bold uppercase">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Over Capacity
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-normal">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(employee.workloadStatus?.toLowerCase() || 'available')}`}>
                      {employee.workloadStatus || 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {employee.currentProjects.length > 0 ? (
                        employee.currentProjects.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] whitespace-nowrap">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isOverloaded ? 'text-red-600' : 'text-green-600'}`}>
                        {dailyHours % 1 === 0 ? dailyHours : dailyHours.toFixed(1)}h
                        <span className="text-gray-400 font-medium ml-0.5">/ 8h</span>
                      </span>
                      {isOverloaded && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold">
                          +{overHours.toFixed(1)}h over
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-[100px] bg-gray-100 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${workload <= 25 ? 'bg-green-500' :
                            workload <= 70 ? 'bg-yellow-500' :
                              workload <= 100 ? 'bg-orange-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(workload, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${isOverloaded ? 'text-red-600' : 'text-green-600'}`}>
                        {Math.round(workload)}%
                      </span>
                    </div>
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
