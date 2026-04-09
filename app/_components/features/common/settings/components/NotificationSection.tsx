'use client';

import { Bell } from 'lucide-react';

interface NotificationSectionProps {
  emailNotifications: boolean;
  setEmailNotifications: (val: boolean) => void;
  systemAlerts: boolean;
  setSystemAlerts: (val: boolean) => void;
}

export function NotificationSection({
  emailNotifications,
  setEmailNotifications,
  systemAlerts,
  setSystemAlerts,
}: NotificationSectionProps) {
  return (
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
  );
}
