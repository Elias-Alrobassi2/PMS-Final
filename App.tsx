import React, { useState, useContext, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Categories from './components/Categories';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import { AppContext } from './context/AppContext';
import { Page } from './types';
import { THEME_COLORS } from './constants';

const pageTitles: Record<Page, string> = {
  dashboard: 'لوحة التحكم',
  products: 'المنتجات',
  categories: 'الفئات',
  settings: 'الإعدادات',
};

function App() {
  const { settings } = useContext(AppContext);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(settings.theme);

    // Apply accent color
    const accent = THEME_COLORS.find(c => c.name === settings.accentColor);
    if (accent) {
      root.style.setProperty('--color-accent', accent.hex);
    }
  }, [settings.theme, settings.accentColor]);
  
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'categories':
        return <Categories />;
      case 'settings':
        return <Settings setActivePage={setActivePage} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200" dir="rtl">
      {/* Sidebar - Desktop */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        className="hidden lg:flex"
      />

      {/* Sidebar - Mobile */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <Sidebar 
            activePage={activePage} 
            setActivePage={(page) => {
              setActivePage(page);
              setIsSidebarOpen(false);
            }}
            className="fixed top-0 right-0 h-full z-50 transform transition-transform"
          />
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle={pageTitles[activePage]}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 pb-20 md:pb-6">
          {renderPage()}
        </main>
        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      </div>
    </div>
  );
}

export default App;
