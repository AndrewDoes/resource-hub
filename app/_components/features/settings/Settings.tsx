'use client';
import { useState } from 'react';
import { User, Bell, Globe, Shield, Save, Upload } from 'lucide-react';

export function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [selectedRole, setSelectedRole] = useState('gm');

  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'General Manager',
  });

  const permissions = [
    { feature: 'View Projects', view: true, edit: true, approve: true },
    { feature: 'Manage Resources', view: true, edit: true, approve: true },
    { feature: 'HR Validation', view: true, edit: false, approve: true },
    { feature: 'AI Recommendations', view: true, edit: true, approve: false },
    { feature: 'Reports', view: true, edit: true, approve: false },
  ];

  const handleSave = () => {
    console.log('Settings saved');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-medium">JD</span>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Change Photo
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={profileData.role}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contact admin to change your role
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500 mt-1">
                Receive email updates about assignments and project changes
              </p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">System Alerts</p>
              <p className="text-xs text-gray-500 mt-1">
                Get notified about resource overload and critical issues
              </p>
            </div>
            <button
              onClick={() => setSystemAlerts(!systemAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemAlerts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* System Preferences */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Globe className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">System Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${theme === 'light'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-white border border-gray-300 rounded"></div>
                  <span className="text-xs font-medium">Light</span>
                </div>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-gray-800 rounded"></div>
                  <span className="text-xs font-medium">Dark</span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>
      </div>

      {/* Access Control */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Access Control</h2>
        </div>

        <div className="space-y-6">
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

          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">Permission Matrix</p>
            <div className="overflow-x-auto">
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
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {permission.feature}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={permission.view}
                          readOnly
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={permission.edit}
                          readOnly
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={permission.approve}
                          readOnly
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
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

      {/* Sticky Save Button - Mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-10">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
