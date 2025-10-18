import React from 'react';
import { MenuIcon } from './Icons';

interface HeaderProps {
  toggleSidebar: () => void;
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, pageTitle }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between sticky top-0 z-30 lg:hidden">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{pageTitle}</h1>
      <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
        <MenuIcon className="w-6 h-6" />
      </button>
    </header>
  );
};

export default Header;
