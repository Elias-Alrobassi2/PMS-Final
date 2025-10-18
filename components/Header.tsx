import React, { useContext } from 'react';
// FIX: Corrected import paths
import { AppContext } from '../context/AppContext';
import { Page } from '../types';
import { MenuIcon, SunIcon, MoonIcon } from './Icons';

interface HeaderProps {
  activePage: Page;
  toggleSidebar: () => void;
}

const pageTitles: Record<Page, string> = {
  dashboard: 'لوحة التحكم',
  products: 'إدارة المنتجات',
  categories: 'إدارة الفئات',
  users: 'إدارة المستخدمين',
  settings: 'الإعدادات',
  // FIX: Added missing 'activity' page title to satisfy the Record<Page, string> type.
  activity: 'سجل النشاط',
};

const Header: React.FC<HeaderProps> = ({ activePage, toggleSidebar }) => {
  const { settings, setSettings, currentUser } = useContext(AppContext);

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };
  
  const theme = settings.theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : settings.theme;

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg sticky top-0 z-30 flex items-center justify-between h-20 px-6 border-b dark:border-gray-700">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden p-2 -ms-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold hidden md:block">{pageTitles[activePage]}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>
        <div className="text-right">
            <div className="font-semibold">{currentUser?.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-accent-blue">
            {currentUser?.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default Header;
