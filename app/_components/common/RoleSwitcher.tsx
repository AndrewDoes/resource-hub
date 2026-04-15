import { useRole, roleConfig } from '@/app/context/RoleContext';
import { Check } from 'lucide-react';
import { UserRole } from '@/app/types';

export function RoleSwitcher() {
  const { currentUser, setCurrentUser } = useRole();

  const roles: UserRole[] = ['marketing', 'pm', 'gm', 'hr', 'employee'];

  const handleRoleChange = (role: UserRole) => {
    const ids = {
      marketing: '58032228-86c3-4dce-b591-ca24c1f7a9e1',
      pm: '11111111-1111-1111-1111-111111111111',
      gm: 'gm-1',
      hr: 'hr-1',
      employee: '91da3fc8-1f9b-4b19-92f9-ba35d6d64a9b',
    };

    const names = {
      marketing: 'Sarah Martinez',
      pm: 'Peter PM',
      gm: 'John Doe',
      hr: 'Emily Chen',
      employee: 'Diana Design',
    };

    const emails = {
      marketing: 'sarah.martinez@company.com',
      pm: 'pm.demo@accelist.local',
      gm: 'john.doe@company.com',
      hr: 'emily.chen@company.com',
      employee: 'designer.demo@accelist.local',
    };

    const avatars = {
      marketing: 'SM',
      pm: 'PP',
      gm: 'JD',
      hr: 'EC',
      employee: 'DD',
    };

    setCurrentUser({
      id: ids[role],
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
