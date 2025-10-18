import { Product, Category, CategoryField, User, Settings, FieldType, Role, UserStatus, AccentColor, Theme, CalendarType, Currency, Permission, ActivityLog } from '../types';

const now = new Date().toISOString();

const users: User[] = [
  {
    id: 'user-1',
    name: 'المدير العام',
    email: 'admin@example.com',
    passwordHash: 'admin123', // In a real app, this should be a proper hash
    role: 'admin' as Role,
    status: 'active' as UserStatus,
    createdAt: now,
    mfaEnabled: false,
  },
  {
    id: 'user-2',
    name: 'مشرف المخزون',
    email: 'manager@example.com',
    passwordHash: 'manager123',
    role: 'manager' as Role,
    status: 'active' as UserStatus,
    createdAt: now,
    mfaEnabled: false,
  },
  {
    id: 'user-3',
    name: 'مستخدم عادي',
    email: 'user@example.com',
    passwordHash: 'user123',
    role: 'user' as Role,
    status: 'active' as UserStatus,
    createdAt: now,
    mfaEnabled: false,
  },
];

const categories: Category[] = [
    { id: 'cat-1', name: 'كاميرات مراقبة', parentId: null },
    { id: 'cat-1-1', name: 'كاميرات داخلية', parentId: 'cat-1' },
    { id: 'cat-1-2', name: 'كاميرات خارجية', parentId: 'cat-1' },
    { id: 'cat-2', name: 'أجهزة تسجيل', parentId: null },
    { id: 'cat-2-1', name: 'DVR', parentId: 'cat-2' },
    { id: 'cat-2-2', name: 'NVR', parentId: 'cat-2' },
    { id: 'cat-3', name: 'ملحقات', parentId: null },
];

const categoryFields: CategoryField[] = [
    { id: 'field-1', categoryId: 'cat-1', key: 'resolution_1', label: 'الدقة', type: FieldType.DROPDOWN, options: ['1080p', '2K', '4K'] },
    { id: 'field-2', categoryId: 'cat-1-1', key: 'lens_type_2', label: 'نوع العدسة', type: FieldType.SHORT_TEXT, options: [] },
    { id: 'field-3', categoryId: 'cat-1-2', key: 'weatherproof_3', label: 'مقاومة للعوامل الجوية', type: FieldType.CHECKBOX, options: [] },
    { id: 'field-4', categoryId: 'cat-2', key: 'channels_4', label: 'عدد القنوات', type: FieldType.NUMBER, options: [] },
    { id: 'field-5', categoryId: 'cat-2', key: 'storage_capacity_5', label: 'سعة التخزين', type: FieldType.SHORT_TEXT, options: [] },
];

const products: Product[] = [
    {
        id: 'prod-1',
        name: 'كاميرا مراقبة داخلية 2K',
        sku: 'CAM-IN-001',
        categoryId: 'cat-1-1',
        price: 250,
        quantity: 50,
        unit: 'قطعة',
        description: 'كاميرا عالية الدقة للاستخدام الداخلي مع رؤية ليلية.',
        image: '',
        dynamicFields: { 'resolution_1': '2K', 'lens_type_2': 'واسعة' },
        createdAt: now,
        updatedAt: now,
    },
    {
        id: 'prod-2',
        name: 'كاميرا خارجية مقاومة للماء',
        sku: 'CAM-OUT-002',
        categoryId: 'cat-1-2',
        price: 450,
        quantity: 30,
        unit: 'قطعة',
        description: 'كاميرا للمراقبة الخارجية بتصنيف IP67.',
        image: '',
        dynamicFields: { 'resolution_1': '4K', 'weatherproof_3': true },
        createdAt: now,
        updatedAt: now,
    },
    {
        id: 'prod-3',
        name: 'جهاز تسجيل DVR 8 قنوات',
        sku: 'DVR-8CH-001',
        categoryId: 'cat-2-1',
        price: 800,
        quantity: 15,
        unit: 'جهاز',
        description: 'جهاز تسجيل يدعم 8 كاميرات بدقة 1080p.',
        image: '',
        dynamicFields: { 'channels_4': 8, 'storage_capacity_5': '1TB' },
        createdAt: now,
        updatedAt: now,
    },
];

const settings: Settings = {
    currency: 'SAR' as Currency,
    accentColor: 'blue' as AccentColor,
    theme: 'system' as Theme,
    calendar: 'gregorian' as CalendarType,
};

const adminPermissions: Permission[] = [
    'dashboard:view',
    'products:view', 'products:create', 'products:edit', 'products:delete',
    'categories:view', 'categories:create', 'categories:edit', 'categories:delete',
    'users:view', 'users:create', 'users:edit', 'users:delete',
    'settings:view', 'settings:edit',
    'activity:view',
];

const managerPermissions: Permission[] = [
    'dashboard:view',
    'products:view', 'products:create', 'products:edit', 'products:delete',
    'categories:view', 'categories:create', 'categories:edit', 'categories:delete',
    'users:view', 'users:create', 'users:edit',
    'settings:view',
];

const userPermissions: Permission[] = [
    'dashboard:view',
    'products:view', 'products:create',
    'categories:view',
];

const viewerPermissions: Permission[] = [
    'dashboard:view',
    'products:view',
    'categories:view',
];

const initialPermissions: Record<Role, Permission[]> = {
    'admin': adminPermissions,
    'manager': managerPermissions,
    'user': userPermissions,
    'viewer': viewerPermissions,
};

const initialActivityLog: ActivityLog[] = [];

export const initialData = {
    products,
    categories,
    categoryFields,
    users,
    settings,
    permissions: initialPermissions,
    activityLog: initialActivityLog,
};