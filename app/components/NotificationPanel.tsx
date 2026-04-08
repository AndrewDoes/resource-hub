'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle, AlertTriangle, Info, X, Clock } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'assignment' | 'approval' | 'alert' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  navigationTarget: string;
  highlightProject?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAllRead,
}: NotificationPanelProps) {
  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
    const target = notification.highlightProject
      ? `${notification.navigationTarget}?highlight=${notification.highlightProject}`
      : notification.navigationTarget;

    router.push(target);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <Info className="w-5 h-5" />;
      case 'approval':
        return <Clock className="w-5 h-5" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-100 text-blue-600';
      case 'approval':
        return 'bg-yellow-100 text-yellow-600';
      case 'alert':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ background: 'transparent' }}
      />

      {/* Panel */}
      <div className="fixed top-16 right-6 z-50 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={onMarkAllRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[500px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No new notifications</p>
              <p className="text-xs text-gray-500">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full px-6 py-4 text-left transition-all hover:bg-gray-50 active:bg-gray-100 ${!notification.read ? 'bg-blue-50/30' : ''
                    }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 h-fit ${getIconColor(
                        notification.type
                      )}`}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p
                          className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {notification.timestamp}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
