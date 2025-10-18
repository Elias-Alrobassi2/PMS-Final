
import React, { useContext } from 'react';
// FIX: Corrected import paths
import { AppContext } from '../context/AppContext';
import { Page } from '../types';
import { DashboardIcon, ProductsIcon, CategoriesIcon, UsersIcon, SettingsIcon, LogoutIcon, BoxIcon, ActivityIcon } from './Icons';
import { checkPermission } from '../utils/permissions';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isSidebarOpen: boolean;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${
      isActive
        ? 'bg-accent-blue text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isSidebarOpen }) => {
  const { logout, currentUser, permissions } = useContext(AppContext);

  const navItems: { page: Page; label: string; icon: React.ReactNode; permission: string }[] = [
    { page: 'dashboard', label: 'لوحة التحكم', icon: <DashboardIcon className="w-5 h-5" />, permission: 'dashboard:view' },
    { page: 'products', label: 'المنتجات', icon: <ProductsIcon className="w-5 h-5" />, permission: 'products:view' },
    { page: 'categories', label: 'الفئات', icon: <CategoriesIcon className="w-5 h-5" />, permission: 'categories:view' },
    { page: 'users', label: 'المستخدمون', icon: <UsersIcon className="w-5 h-5" />, permission: 'users:view' },
    { page: 'settings', label: 'الإعدادات', icon: <SettingsIcon className="w-5 h-5" />, permission: 'settings:view' },
    { page: 'activity', label: 'سجل النشاط', icon: <ActivityIcon className="w-5 h-5" />, permission: 'activity:view' },
  ];
  
  const accessibleNavItems = navItems.filter(item => checkPermission(currentUser, item.permission, permissions));

  return (
    <aside className={`bg-white dark:bg-gray-800 border-e dark:border-gray-700 flex flex-col transition-all duration-300 fixed md:relative h-full z-40 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} md:w-64`}>
      <div className="flex items-center justify-center h-20 border-b dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
           <BoxIcon className="w-8 h-8 text-accent-blue" />
           <span className="text-xl font-bold">الصدارة</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {accessibleNavItems.map((item) => (
          <NavItem
            key={item.page}
            icon={item.icon}
            label={item.label}
            isActive={activePage === item.page}
            onClick={() => setActivePage(item.page)}
          />
        ))}
      </nav>
      <div className="p-4 border-t dark:border-gray-700">
         <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 mb-4">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold text-accent-blue">
                    {currentUser?.name.charAt(0)}
                </div>
                <div className="text-right flex-1 overflow-hidden">
                    <div className="font-semibold text-sm truncate">{currentUser?.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</div>
                </div>
            </div>
        </div>
        <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
            <LogoutIcon className="w-5 h-5" />
            <span className="font-semibold">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
