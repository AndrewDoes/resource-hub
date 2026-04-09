'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

// Sub-components
import { ProfileSection } from './components/ProfileSection';
import { NotificationSection } from './components/NotificationSection';
import { PreferencesSection } from './components/PreferencesSection';
import { AccessControlSection } from './components/AccessControlSection';

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
      <ProfileSection
        profileData={profileData}
        onUpdateProfile={(data) => setProfileData({ ...profileData, ...data })}
      />

      {/* Notification Settings */}
      <NotificationSection
        emailNotifications={emailNotifications}
        setEmailNotifications={setEmailNotifications}
        systemAlerts={systemAlerts}
        setSystemAlerts={setSystemAlerts}
      />

      {/* System Preferences */}
      <PreferencesSection
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Access Control */}
      <AccessControlSection
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />

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
