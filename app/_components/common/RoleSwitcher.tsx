import { useRole, roleConfig } from '@/app/context/RoleContext';
import { Check } from 'lucide-react';
import { UserRole } from '@/app/types';

export function RoleSwitcher() {
  const { currentUser, setCurrentUser } = useRole();

  const roles: UserRole[] = ['marketing', 'pm', 'gm', 'hr', 'employee'];

  const handleRoleChange = (role: UserRole) => {
    const names = {
      marketing: 'Sarah Martinez',
      pm: 'Alex Johnson',
      gm: 'John Doe',
      hr: 'Emily Chen',
      employee: 'David Lee',
    };

    const emails = {
      marketing: 'sarah.martinez@company.com',
      pm: 'alex.johnson@company.com',
      gm: 'john.doe@company.com',
      hr: 'emily.chen@company.com',
      employee: 'david.lee@company.com',
    };

    const avatars = {
      marketing: 'SM',
      pm: 'AJ',
      gm: 'JD',
      hr: 'EC',
      employee: 'DL',
    };

    setCurrentUser({
      name: names[role],
      role,
      avatar: avatars[role],
      email: emails[role],
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Switch Role (Demo)</h3>
      <div className="space-y-2">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleChange(role)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${currentUser.role === role
              ? 'bg-gradient-to-r ' + roleConfig[role].color + ' text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <span className="text-sm font-medium">{roleConfig[role].label}</span>
            {currentUser.role === role && <Check className="w-4 h-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}
