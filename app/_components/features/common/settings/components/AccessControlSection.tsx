'use client';

import { Shield, Lock } from 'lucide-react';

interface AccessControlSectionProps {
  selectedRole: string;
  // OLD: Role switching prop — removed as users should not switch roles from Settings.
  // setSelectedRole: (role: string) => void;
}

export function AccessControlSection({
  selectedRole,
  // setSelectedRole, // OLD: removed
}: AccessControlSectionProps) {
  const permissions = [
    { feature: 'View Projects', view: true, edit: true, approve: true },
    { feature: 'Manage Resources', view: true, edit: true, approve: true },
    { feature: 'HR Validation', view: true, edit: false, approve: true },
    { feature: 'AI Recommendations', view: true, edit: true, approve: false },
    { feature: 'Reports', view: true, edit: true, approve: false },
  ];

  // Map role keys to display-friendly labels
  const roleDisplayNames: Record<string, string> = {
    gm: 'General Manager',
    hr: 'HR Manager',
    pm: 'Project Manager',
    marketing: 'Marketing Manager',
    employee: 'Employee',
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
          <Shield className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Access Control</h2>
      </div>

      <div className="space-y-6">
        {/* OLD: Role switching dropdown — commented out.
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="gm">General Manager</option>
            <option value="hr">HR Manager</option>
            <option value="pm">Project Manager</option>
            <option value="marketing">Marketing Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>
        */}

        {/* Static display of the current role instead */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Role
          </label>
          <div className="w-full max-w-md px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700">
            {roleDisplayNames[selectedRole] ?? selectedRole}
          </div>
        </div>

        {/* Permission Matrix — read-only presentation */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm font-medium text-gray-900">Permission Matrix</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full border border-gray-200">
              <Lock className="w-3 h-3" />
              Read-only
            </span>
          </div>
          <div className="overflow-x-auto opacity-75 pointer-events-none select-none">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    View
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Edit
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Approve
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {permissions.map((permission, index) => (
                  <tr key={index} className="bg-gray-50/40">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {permission.feature}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={permission.view}
                        disabled
                        readOnly
                        className="w-4 h-4 text-gray-400 bg-gray-100 border-gray-300 rounded cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={permission.edit}
                        disabled
                        readOnly
                        className="w-4 h-4 text-gray-400 bg-gray-100 border-gray-300 rounded cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={permission.approve}
                        disabled
                        readOnly
                        className="w-4 h-4 text-gray-400 bg-gray-100 border-gray-300 rounded cursor-not-allowed"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Permissions are determined by your role. Contact your administrator to modify access.
          </p>
        </div>
      </div>
    </div>
  );
}
