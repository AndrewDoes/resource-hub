'use client';

import { Globe } from 'lucide-react';

interface PreferencesSectionProps {
  theme: string;
  setTheme: (theme: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

export function PreferencesSection({
  theme,
  setTheme,
  language,
  setLanguage,
}: PreferencesSectionProps) {
  return (
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
  );
}
