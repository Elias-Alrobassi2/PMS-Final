import React from 'react';
import { Page } from '../types';
import { DashboardIcon, BoxIcon, CategoryIcon, SettingsIcon } from './Icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  className?: string;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
      isActive
        ? 'bg-accent-blue text-white shadow-lg'
        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, className }) => {
  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard', label: 'لوحة التحكم', icon: <DashboardIcon className="w-6 h-6" /> },
    { page: 'products', label: 'المنتجات', icon: <BoxIcon className="w-6 h-6" /> },
    { page: 'categories', label: 'الفئات', icon: <CategoryIcon className="w-6 h-6" /> },
    { page: 'settings', label: 'الإعدادات', icon: <SettingsIcon className="w-6 h-6" /> },
  ];

  return (
    <aside className={`bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 w-64 p-4 space-y-8 flex-shrink-0 ${className}`}>
      <div className="flex items-center gap-3 p-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-blue"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        <h1 className="text-2xl font-bold">مخزني</h1>
      </div>
      <nav>
        <ul className="space-y-3">
          {navItems.map(item => (
            <NavItem
              key={item.page}
              label={item.label}
              icon={item.icon}
              isActive={activePage === item.page}
              onClick={() => setActivePage(item.page)}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
