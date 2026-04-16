import { useRole, roleConfig } from '@/app/context/RoleContext';
import { Check } from 'lucide-react';
import { UserRole } from '@/app/types';
import { login } from '@/functions/api/auth';

export function RoleSwitcher() {
  const { currentUser, setCurrentUser, setToken } = useRole();

  const roles: UserRole[] = ['marketing', 'pm', 'gm', 'hr', 'employee'];

  const handleRoleChange = async (role: UserRole) => {
    const emails = {
      marketing: 'marketing.demo@accelist.local',
      pm: 'pm.demo@accelist.local',
      gm: 'gm.demo@accelist.local',
      hr: 'hr.demo@accelist.local',
      employee: 'designer.demo@accelist.local',
    };

    try {
      // Perform a real login to get a valid token for the backend
      const response = await login(emails[role], 'password123');

      if (response.success && response.token) {
        localStorage.setItem('auth_token', response.token);
        if (response.user) {
          localStorage.setItem('user_profile', JSON.stringify(response.user));
          setCurrentUser(response.user);
        }
        setToken(response.token);

        // Force a page reload to reset all API caches and start polling with new identity
        window.location.reload();
      } else {
        console.error('Login failed during role switch:', response.message);
      }
    } catch (err) {
      console.error('Role switch error:', err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Switch Role (Demo)</h3>
      <div className="space-y-2">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleChange(role)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${currentUser?.role === role
              ? 'bg-gradient-to-r ' + roleConfig[role].color + ' text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <span className="text-sm font-medium">{roleConfig[role].label}</span>
            {currentUser?.role === role && <Check className="w-4 h-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}
