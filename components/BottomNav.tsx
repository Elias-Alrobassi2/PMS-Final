import React from 'react';
import { Page } from '../types';
import { DashboardIcon, BoxIcon, CategoryIcon, SettingsIcon } from './Icons';

interface BottomNavProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors ${isActive ? 'text-accent-blue' : 'text-gray-500 dark:text-gray-400'}`}
    >
        {icon}
        <span className="text-xs mt-1">{label}</span>
    </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
    const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
        { page: 'dashboard', label: 'الرئيسية', icon: <DashboardIcon className="w-6 h-6" /> },
        { page: 'products', label: 'المنتجات', icon: <BoxIcon className="w-6 h-6" /> },
        { page: 'categories', label: 'الفئات', icon: <CategoryIcon className="w-6 h-6" /> },
        { page: 'settings', label: 'الإعدادات', icon: <SettingsIcon className="w-6 h-6" /> },
    ];
    
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-[0_-2px_5px_rgba(0,0,0,0.1)] flex justify-around z-40">
            {navItems.map(item => (
                <NavItem
                    key={item.page}
                    label={item.label}
                    icon={item.icon}
                    isActive={activePage === item.page}
                    onClick={() => setActivePage(item.page)}
                />
            ))}
        </div>
    );
};

export default BottomNav;
