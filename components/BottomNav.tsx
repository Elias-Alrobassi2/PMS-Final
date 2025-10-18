
import React, { useContext } from 'react';
// FIX: Corrected import paths
import { AppContext } from '../context/AppContext';
import { Page } from '../types';
import { DashboardIcon, ProductsIcon, CategoriesIcon, UsersIcon, SettingsIcon, ActivityIcon } from './Icons';
import { checkPermission } from '../utils/permissions';

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 transition-colors ${
      isActive ? 'text-accent-blue' : 'text-gray-500 dark:text-gray-400'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const { currentUser, permissions } = useContext(AppContext);
  
  const navItems: { page: Page; label: string; icon: React.ReactNode; permission: string }[] = [
    { page: 'dashboard', label: 'الرئيسية', icon: <DashboardIcon className="w-6 h-6" />, permission: 'dashboard:view' },
    { page: 'products', label: 'المنتجات', icon: <ProductsIcon className="w-6 h-6" />, permission: 'products:view' },
    { page: 'categories', label: 'الفئات', icon: <CategoriesIcon className="w-6 h-6" />, permission: 'categories:view' },
    { page: 'users', label: 'المستخدمون', icon: <UsersIcon className="w-6 h-6" />, permission: 'users:view' },
    { page: 'settings', label: 'الإعدادات', icon: <SettingsIcon className="w-6 h-6" />, permission: 'settings:view' },
  ];

  const accessibleNavItems = navItems.filter(item => checkPermission(currentUser, item.permission, permissions));

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around z-40">
      {accessibleNavItems.map((item) => (
        <NavItem
          key={item.page}
          icon={item.icon}
          label={item.label}
          isActive={activePage === item.page}
          onClick={() => setActivePage(item.page)}
        />
      ))}
    </div>
  );
};

export default BottomNav;
