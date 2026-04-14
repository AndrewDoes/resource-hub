"use client";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";
import { roleConfig, useRole } from "@/app/context/RoleContext";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  const { currentUser, logout } = useRole();
  const router = useRouter();

  if (!isOpen || !currentUser) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>

      {/* Dropdown */}
      <div className="absolute top-16 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* User Info Section */}
        <div
          className={`bg-linear-to-br ${roleConfig[currentUser.role]?.color || 'from-gray-500 to-gray-600'} p-6 text-white`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold">
                {currentUser.avatar || currentUser.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-lg">{currentUser.name}</p>
              <p className="text-sm opacity-90">{currentUser.email}</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-2 inline-block">
            <p className="text-xs opacity-75 mb-0.5">Current Role</p>
            <p className="text-sm font-semibold">
              {roleConfig[currentUser.role]?.label || 'User'}
            </p>
          </div>
        </div>

        {/* Action Section */}
        <div className="p-4">
           <p className="text-xs text-gray-500 px-3 mb-2 uppercase font-bold tracking-wider">Account</p>
           <button 
             onClick={() => {
                router.push('/settings');
                onClose();
             }}
             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left"
           >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Account Settings</span>
           </button>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button 
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
