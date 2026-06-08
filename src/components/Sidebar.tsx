import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { USERS, ROLE_LABELS } from '@/data/mock';
import type { Role } from '@/data/mock';

type Page = 'dashboard' | 'clients' | 'deals' | 'tasks' | 'invoices' | 'analytics' | 'roles';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  currentUser: typeof USERS[0];
}

const navItems: { id: Page; label: string; icon: string; roles: Role[] }[] = [
  { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard', roles: ['admin', 'sales', 'support'] },
  { id: 'clients', label: 'Клиенты', icon: 'Users', roles: ['admin', 'sales', 'support'] },
  { id: 'deals', label: 'Сделки', icon: 'Handshake', roles: ['admin', 'sales'] },
  { id: 'tasks', label: 'Задачи', icon: 'CheckSquare', roles: ['admin', 'sales', 'support'] },
  { id: 'invoices', label: 'Счета', icon: 'Receipt', roles: ['admin', 'sales'] },
  { id: 'analytics', label: 'Аналитика', icon: 'BarChart3', roles: ['admin', 'sales'] },
  { id: 'roles', label: 'Роли и права', icon: 'Shield', roles: ['admin'] },
];

export default function Sidebar({ currentPage, onNavigate, currentUser }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const visibleItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside
      className="flex flex-col h-full transition-all duration-300"
      style={{
        width: collapsed ? 68 : 240,
        background: 'hsl(220 25% 10%)',
        borderRight: '1px solid hsl(220 20% 16%)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'hsl(244 80% 60%)' }}>
          <Icon name="Zap" size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-base tracking-tight">CRM Pro</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-white/30 hover:text-white/70 transition-colors"
        >
          <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
        </button>
      </div>

      <div className="px-3 mb-2">
        <div style={{ height: 1, background: 'hsl(220 20% 16%)' }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`nav-item w-full ${currentPage === item.id ? 'active' : 'text-white/50'}`}
            title={collapsed ? item.label : undefined}
          >
            <Icon name={item.icon} size={18} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="px-3 mb-3">
        <div style={{ height: 1, background: 'hsl(220 20% 16%)' }} />
      </div>

      {/* User */}
      <div className={`px-3 pb-5 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: 'hsl(244 80% 60%)' }}
        >
          {currentUser.avatar}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{currentUser.name}</div>
            <div className="text-white/40 text-xs truncate">{ROLE_LABELS[currentUser.role]}</div>
          </div>
        )}
      </div>
    </aside>
  );
}
