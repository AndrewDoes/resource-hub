'use client';

import { User, Upload } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  role: string;
}

interface ProfileSectionProps {
  profileData: ProfileData;
  onUpdateProfile: (data: Partial<ProfileData>) => void;
}

export function ProfileSection({ profileData, onUpdateProfile }: ProfileSectionProps) {
  return (
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
            <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
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
                onChange={(e) => onUpdateProfile({ name: e.target.value })}
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
                onChange={(e) => onUpdateProfile({ email: e.target.value })}
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
  );
}
