"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarCheck,
  BarChart3,
  Settings,
  FileText,
  ClipboardCheck,
  Folder,
  Gavel,
  FileX,
} from "lucide-react";
import { UserRole } from "@/app/types";
import { roleConfig } from "@/app/context/RoleContext";

export interface MenuItem {
  path: string;
  label: string;
  icon: any;
  roles: UserRole[];
}

export const allMenuItems: MenuItem[] = [
  {
    path: "/pm/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["pm"],
  },
  {
    path: "/gm/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["gm"],
  },
  {
    path: "/hr/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["hr"],
  },
  {
    path: "/marketing/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["marketing"],
  },
  {
    path: "/employee/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["employee"],
  },

  {
    path: "/marketing/projects",
    label: "Create Project",
    icon: FileText,
    roles: ["marketing"],
  },
  {
    path: "/marketing/project-revision",
    label: "Project Revision",
    icon: FileX,
    roles: ["marketing"],
  },
  {
    path: "/pm/project-overview",
    label: "Project Overview",
    icon: Folder,
    roles: ["pm"],
  },
  {
    path: "/pm/project-manager",
    label: "Project Manager",
    icon: Briefcase,
    roles: ["pm"],
  },
  {
    path: "/gm/planning",
    label: "Planning",
    icon: CalendarCheck,
    roles: ["gm"],
  },
  {
    path: "/gm/decision-panel",
    label: "Decision Panel",
    icon: Gavel,
    roles: ["gm"],
  },
  {
    path: "/hr/hr-validation",
    label: "HR Validation",
    icon: ClipboardCheck,
    roles: ["hr"],
  },
  {
    path: "/hr/hiring",
    label: "Hiring Management",
    icon: Briefcase,
    roles: ["hr"],
  },
  {
    path: "/hr/employee-management",
    label: "Employee Management",
    icon: Users,
    roles: ["hr"],
  },
  {
    path: "/employee/my-projects",
    label: "My Projects",
    icon: Briefcase,
    roles: ["employee"],
  },
  {
    path: "/employee/employee",
    label: "My Stats",
    icon: Users,
    roles: ["employee"],
  },
  {
    path: "/gm/resource-overview",
    label: "Resource Overview",
    icon: Users,
    roles: ["gm"],
  },
  {
    path: "/common/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["gm", "hr"],
  },
  {
    path: "/marketing/settings",
    label: "Settings",
    icon: Settings,
    roles: ["marketing"],
  },
  { path: "/pm/settings", label: "Settings", icon: Settings, roles: ["pm"] },
  { path: "/gm/settings", label: "Settings", icon: Settings, roles: ["gm"] },
  { path: "/hr/settings", label: "Settings", icon: Settings, roles: ["hr"] },
  {
    path: "/employee/settings",
    label: "Settings",
    icon: Settings,
    roles: ["employee"],
  },
];

interface SidebarProps {
  currentUser: {
    name: string;
    role: UserRole;
    avatar: string;
  };
}

export function Sidebar({ currentUser }: SidebarProps) {
  console.log("Current role:", currentUser.role);
  const pathname = usePathname();
  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(currentUser.role),
  );

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">ResourceHub</h1>
        <p className="text-sm text-gray-500 mt-1">Planning System</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active
                  ? "bg-linear-to-r from-blue-50 to-green-50 text-blue-700 font-semibold shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div
            className={`w-8 h-8 bg-linear-to-br ${roleConfig[currentUser.role].color} rounded-full flex items-center justify-center`}
          >
            <span className="text-white text-sm font-medium">
              {currentUser.avatar}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {roleConfig[currentUser.role].label}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
