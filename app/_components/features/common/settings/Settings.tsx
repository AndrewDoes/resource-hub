"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, AlertCircle } from "lucide-react";

// Sub-components
import { ProfileSection } from "./components/ProfileSection";
import { PasswordSection } from "./components/PasswordSection";
import { NotificationSection } from "./components/NotificationSection";
import { PreferencesSection } from "./components/PreferencesSection";
import { AccessControlSection } from "./components/AccessControlSection";

import { useRole } from "@/app/context/RoleContext";
import { getInitials } from "@/utils/stringUtils";
import { authorizedFetch } from "@/functions/api/authorizedFetch";
// OLD: No longer needed after removing role switching from Settings.
// import { useRouter } from "next/navigation";
// import { UserRole } from "@/app/types";

export function Settings() {
  const { currentUser, setCurrentUser } = useRole();
  // const router = useRouter(); // OLD: removed with role switching

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");

  // Profile data fetched from the API
  const [profileData, setProfileData] = useState<{
    name: string;
    email: string;
    role: string;
  }>({
    name: "",
    email: "",
    role: "",
  });

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  // OLD: Only used by handleRoleSwitch, which has been removed.
  // const roleDefaultPages: Record<UserRole, string> = {
  //   marketing: "/marketing/projects",
  //   pm: "/pm/project-overview",
  //   gm: "/gm/planning",
  //   hr: "/hr/hr-validation",
  //   employee: "/employee/my-projects",
  // };

  // Previous mock data (does not match seeded DB data)
  // const roleUserData = {
  //   marketing: {
  //     name: 'Sarah Martinez',
  //     email: 'sarah.martinez@company.com',
  //     avatar: 'SM',
  //   },
  //   pm: {
  //     name: 'Alex Johnson',
  //     email: 'alex.johnson@company.com',
  //     avatar: 'AJ',
  //   },
  //   gm: {
  //     name: 'John Doe',
  //     email: 'john.doe@company.com',
  //     avatar: 'JD',
  //   },
  //   hr: {
  //     name: 'Emily Chen',
  //     email: 'emily.chen@company.com',
  //     avatar: 'EC',
  //   },
  //   employee: {
  //     name: 'David Lee',
  //     email: 'david.lee@company.com',
  //     avatar: 'DL',
  //   },
  // };

  // Updated to match seeded database users for API integration
  const roleUserData = {
    marketing: {
      name: "Maya Marketing",
      email: "marketing.demo@accelist.local",
      avatar: "MM",
    },
    pm: {
      name: "Peter PM",
      email: "pm.demo@accelist.local",
      avatar: "PP",
    },
    gm: {
      name: "Grace GM",
      email: "gm.demo@accelist.local",
      avatar: "GG",
    },
    hr: {
      name: "Helen HR",
      email: "hr.demo@accelist.local",
      avatar: "HH",
    },
    employee: {
      name: "Ben Backend",
      email: "backend.demo@accelist.local",
      avatar: "BB",
    },
  };

  // Fetch profile from backend API once on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authorizedFetch("/api/gateway/api/User/get-profile");

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfileData({
          name: data.fullName,
          email: data.email,
          role: data.role,
        });
      } catch (err: any) {
        setError(err.message);
        // Fallback to currentUser context data if API fails
        setProfileData({
          name: currentUser?.name || "",
          email: currentUser?.email || "",
          role: currentUser?.role || "",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch once on mount

  // OLD: Role switching from Settings has been removed.
  // const handleRoleSwitch = (role: string) => {
  //   const userRole = role as UserRole;
  //   const userData = roleUserData[userRole];
  //   setCurrentUser({
  //     name: userData.name,
  //     role: userRole,
  //     avatar: userData.avatar,
  //     email: userData.email,
  //   });
  //   // Instantly take them to their main functionality
  //   router.push(roleDefaultPages[userRole]);
  // };

  const handleSave = async () => {
    if (!currentUser) return;

    console.log("Current user name: ", currentUser.name);
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const response = await authorizedFetch("/api/gateway/api/User/update-profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: profileData.name,
          email: profileData.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.title || "Failed to save profile");
      }

      const data = await response.json();
      const initials = getInitials(data.fullName);

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          name: data.fullName,
          email: data.email,
          avatar: initials,
          role: currentUser.role // Explicitly pass the role to satisfy TypeScript
        });
      }

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
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
        <div className="flex items-center gap-3">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Saved successfully
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              Failed to save
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          Error loading profile: {error}
        </div>
      )}

      {/* Profile Settings */}
      <ProfileSection
        profileData={profileData}
        onUpdateProfile={(data) => setProfileData({ ...profileData, ...data })}
        isLoading={isLoading}
      />

      {/* Password Settings */}
      <PasswordSection />

      {/* Notification Settings */}
      <NotificationSection
        emailNotifications={emailNotifications}
        setEmailNotifications={setEmailNotifications}
        systemAlerts={systemAlerts}
        setSystemAlerts={setSystemAlerts}
      />

      {/* System Preferences */}
      {/* <PreferencesSection
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
      /> */}

      {/* Access Control */}
      <AccessControlSection
        selectedRole={currentUser?.role || ""}
      // setSelectedRole={handleRoleSwitch} // OLD: removed
      />

      {/* Sticky Save Button - Mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-10">
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
