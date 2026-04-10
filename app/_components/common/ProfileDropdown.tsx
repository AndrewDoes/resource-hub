"use client";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { roleConfig, useRole } from "@/app/context/RoleContext";
import { UserRole } from "@/app/types";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const roleDefaultPages: Record<UserRole, string> = {
  marketing: "/marketing/dashboard",
  pm: "/pm/project-overview",
  gm: "/gm/planning",
  hr: "/hr/hr-validation",
  employee: "/employee/my-projects",
};

export function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  const { currentUser, setCurrentUser } = useRole();
  const router = useRouter();

  const roles: UserRole[] = ["marketing", "pm", "gm", "hr", "employee"];

  const roleUserData = {
    marketing: {
      name: "Sarah Martinez",
      email: "sarah.martinez@company.com",
      avatar: "SM",
    },
    pm: {
      name: "Alex Johnson",
      email: "alex.johnson@company.com",
      avatar: "AJ",
    },
    gm: {
      name: "John Doe",
      email: "john.doe@company.com",
      avatar: "JD",
    },
    hr: {
      name: "Emily Chen",
      email: "emily.chen@company.com",
      avatar: "EC",
    },
    employee: {
      name: "David Lee",
      email: "david.lee@company.com",
      avatar: "DL",
    },
  };

  const handleRoleSwitch = (role: UserRole) => {
    const userData = roleUserData[role];
    setCurrentUser({
      name: userData.name,
      role,
      avatar: userData.avatar,
      email: userData.email,
    });

    // Navigate to the default page for this role
    router.push(roleDefaultPages[role]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>

      {/* Dropdown */}
      <div className="absolute top-16 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* User Info Section */}
        <div
          className={`bg-linear-to-br ${roleConfig[currentUser.role].color} p-6 text-white`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold">
                {currentUser.avatar}
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
              {roleConfig[currentUser.role].label}
            </p>
          </div>
        </div>

        {/* Role Switcher Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Switch Role</h3>
            <span className="text-xs text-gray-500">Demo Mode</span>
          </div>

          <div className="space-y-1">
            {roles.map((role) => {
              const isActive = currentUser.role === role;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left ${
                    isActive
                      ? `bg-linear-to-r ${roleConfig[role].color} text-white shadow-md`
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-white/20 backdrop-blur"
                          : `bg-linear-to-br ${roleConfig[role].color}`
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${isActive ? "text-white" : "text-white"}`}
                      >
                        {roleUserData[role].avatar}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {roleConfig[role].label}
                      </p>
                      <p
                        className={`text-xs ${isActive ? "text-white/75" : "text-gray-500"}`}
                      >
                        {roleUserData[role].name}
                      </p>
                    </div>
                  </div>
                  {isActive && <Check className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors text-left">
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
