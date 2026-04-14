'use client';
import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarCheck,
  Sparkles,
  BarChart3,
  Settings,
  Bell,
  User,
  FileText,
  ClipboardCheck,
  Folder,
  UserCheck,
  Gavel,
  ChevronDown,
  CheckSquare,
} from 'lucide-react';
import { Notification, UserRole } from '@/app/types';
import { roleConfig, useRole } from '@/app/context/RoleContext';
import { ToastProvider } from '@/app/context/ToastContext';
import { NotificationPanel } from '../common/NotificationPanel';
import { ProfileDropdown } from '../common/ProfileDropdown';

interface MenuItem {
  path: string;
  label: string;
  icon: any;
  roles: UserRole[];
}

const allMenuItems: MenuItem[] = [
  { path: '/marketing/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['marketing'] },
  { path: '/pm/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['pm'] },
  { path: '/gm/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['gm'] },
  { path: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['hr'] },
  { path: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['employee'] },

  { path: '/marketing/projects', label: 'Create Project', icon: FileText, roles: ['marketing'] },
  { path: '/pm/project-overview', label: 'Project Overview', icon: Folder, roles: ['pm'] },
  { path: '/pm/project-manager', label: 'Project Manager', icon: Briefcase, roles: ['pm'] },
  { path: '/pm/task-assignments', label: 'Task Assignments', icon: CheckSquare, roles: ['pm'] },
  { path: '/gm/planning', label: 'Planning', icon: CalendarCheck, roles: ['gm'] },
  { path: '/gm/decision-panel', label: 'Decision Panel', icon: Gavel, roles: ['gm'] },
  { path: '/hr/hr-validation', label: 'HR Validation', icon: ClipboardCheck, roles: ['hr'] },
  { path: '/hr/hiring', label: 'Hiring Management', icon: Briefcase, roles: ['hr'] },
  { path: '/hr/employee-management', label: 'Employee Management', icon: Users, roles: ['hr'] },
  { path: '/employee/my-projects', label: 'My Projects', icon: Briefcase, roles: ['employee'] },
  { path: '/employee/employee', label: 'My Profile', icon: User, roles: ['employee'] },
  { path: '/gm/resource-overview', label: 'Resource Overview', icon: Users, roles: ['gm'] },

  // Settings/Reports could be role-prefixed or shared. Assuming role-prefixed for consistency.
  { path: '/marketing/settings', label: 'Settings', icon: Settings, roles: ['marketing'] },
  { path: '/pm/settings', label: 'Settings', icon: Settings, roles: ['pm'] },
  { path: '/gm/settings', label: 'Settings', icon: Settings, roles: ['gm'] },
  { path: '/hr/settings', label: 'Settings', icon: Settings, roles: ['hr'] },
  { path: '/employee/settings', label: 'Settings', icon: Settings, roles: ['employee'] },
];

// Role-based notification filtering helper
const filterNotificationsByRole = (notifications: Notification[], role: UserRole): Notification[] => {
  // Define which notification types are relevant for each role
  const roleNotificationTypes: Record<UserRole, string[]> = {
    marketing: ['approval', 'alert', 'info'],
    gm: ['approval', 'alert', 'info'],
    pm: ['assignment', 'alert', 'info'],
    hr: ['approval', 'alert', 'info'],
    employee: ['assignment', 'info'],
  };

  return notifications.filter((notification) => {
    // Check if notification type is relevant for this role
    if (!roleNotificationTypes[role].includes(notification.type)) {
      return false;
    }

    // Additional role-specific filtering based on navigation target
    switch (role) {
      case 'marketing':
        return notification.navigationTarget.includes('/projects') ||
          notification.navigationTarget.includes('/dashboard');
      case 'gm':
        return notification.navigationTarget.includes('/planning') ||
          notification.navigationTarget.includes('/decision-panel') ||
          notification.navigationTarget.includes('/dashboard');
      case 'pm':
        return notification.navigationTarget.includes('/project-overview') ||
          notification.navigationTarget.includes('/employee') ||
          notification.navigationTarget.includes('/dashboard');
      case 'hr':
        return notification.navigationTarget.includes('/hr-validation') ||
          notification.navigationTarget.includes('/employee-management') ||
          notification.navigationTarget.includes('/dashboard');
      case 'employee':
        return notification.navigationTarget.includes('/employee') ||
          notification.navigationTarget.includes('/my-projects') ||
          notification.navigationTarget.includes('/dashboard');
      default:
        return true;
    }
  });
};

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'assignment',
    title: 'New Project Assignment',
    message: 'You have been assigned to "Website Redesign" project',
    timestamp: '5 minutes ago',
    read: false,
    navigationTarget: '/employee/my-projects',
  },
  {
    id: '2',
    type: 'approval',
    title: 'Approval Required',
    message: 'Resource assignment pending your approval for Mobile App project',
    timestamp: '1 hour ago',
    read: false,
    navigationTarget: '/hr/hr-validation',
  },
  {
    id: '3',
    type: 'alert',
    title: 'Project Delay Risk',
    message: 'Marketing Campaign may miss deadline due to resource shortage',
    timestamp: '2 hours ago',
    read: false,
    navigationTarget: '/gm/planning',
    highlightProject: 'marketing-campaign',
  },
  {
    id: '4',
    type: 'alert',
    title: 'Resource Overload',
    message: 'David Lee is allocated at 110% - immediate action required',
    timestamp: '3 hours ago',
    read: true,
    navigationTarget: '/gm/planning',
    highlightProject: 'resource-conflict',
  },
];

export function Root({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentUser } = useRole();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const menuItems = allMenuItems.filter((item) => item.roles.includes(currentUser.role));

  // Filter notifications by current role
  const filteredNotifications = filterNotificationsByRole(notifications, currentUser.role);
  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${active
                    ? 'bg-linear-to-r from-blue-50 to-green-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
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
              <div className={`w-8 h-8 bg-linear-to-br ${roleConfig[currentUser.role].color} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-medium">{currentUser.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{roleConfig[currentUser.role].label}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className={`relative p-2 rounded-lg transition-all ${notificationOpen
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{unreadCount}</span>
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className={`w-8 h-8 bg-linear-to-br ${roleConfig[currentUser.role].color} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">{currentUser.avatar}</span>
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{roleConfig[currentUser.role].label}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </header>

          {/* Notification Panel */}
          <NotificationPanel
            isOpen={notificationOpen}
            onClose={() => setNotificationOpen(false)}
            notifications={filteredNotifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
          />

          {/* Profile Dropdown */}
          <ProfileDropdown
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
