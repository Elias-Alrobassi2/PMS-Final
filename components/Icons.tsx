import React from 'react';

// A generic Icon wrapper to set common SVG properties
const Icon: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const BoxIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </Icon>
);

export const CategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
         <path d="M2 17l4-4-4-4"/>
        <path d="M10.2 20.8a2.5 2.5 0 0 0 3.6 0l7.4-7.4a2.5 2.5 0 0 0 0-3.6L13.8 2.4a2.5 2.5 0 0 0-3.6 0L2.8 9.8a2.5 2.5 0 0 0 0 3.6Z"/>
        <path d="M11 11h.01"/>
    </Icon>
);

export const DollarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </Icon>
);

export const LowStockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path d="M21.54 15H17a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4.46" />
        <path d="M19.1 14.53 17 12 19.1 9.47" />
        <path d="M11.6 16.8a3 3 0 0 0-3.2-2.8H3" />
        <path d="m5 18-2-2 2-2" />
        <path d="M7 14h5.5" />
        <path d="M3 8h5.5" />
        <path d="M8.5 6H13a3 3 0 0 1 3 3v1" />
        <path d="m11 8 2-2-2-2" />
    </Icon>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </Icon>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path d="M3 6h18"></path>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </Icon>
);

export const ViewIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </Icon>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </Icon>
);

export const FolderIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </Icon>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </Icon>
);

export const GearIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </Icon>
);

export const InfoCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </Icon>
);

export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <polyline points="15 18 9 12 15 6"></polyline>
    </Icon>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </Icon>
);

export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </Icon>
);

export const DashboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
    </Icon>
);


export const SettingsIcon: React.FC<{ className?: string }> = GearIcon; // Alias

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </Icon>
);
