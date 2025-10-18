
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import { Page } from './types';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Categories from './components/Categories';
import Users from './components/Users';
import Settings from './components/Settings';
import Activity from './components/Activity';
import BottomNav from './components/BottomNav';
import Login from './components/Login';

const App: React.FC = () => {
  const { currentUser, settings } = useContext(AppContext);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Apply theme and accent color
    const root = window.document.documentElement;
    const theme = settings.theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.setProperty('--accent-color', `var(--accent-${settings.accentColor})`);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if(settings.theme === 'system') {
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    }
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme, settings.accentColor]);

  if (!currentUser) {
    return <Login />;
  }
  
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'products':
        return <Products />;
      case 'categories':
        return <Categories />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      case 'activity':
        return <Activity />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100" dir="rtl">
      <Sidebar activePage={activePage} setActivePage={setActivePage} isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activePage={activePage} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 pb-24 md:pb-6">
          {renderPage()}
        </main>
        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      </div>
      {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"></div>}
    </div>
  );
};

export default App;
