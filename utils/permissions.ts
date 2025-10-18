import { User, Role, Permission } from '../types';

export const ROLES_HIERARCHY: Role[] = ['admin', 'manager', 'user', 'viewer'];

export const permissionDescriptions: Record<Permission, string> = {
    'dashboard:view': 'عرض لوحة التحكم',
    'products:view': 'عرض المنتجات',
    'products:create': 'إضافة منتجات',
    'products:edit': 'تعديل المنتجات',
    'products:delete': 'حذف المنتجات',
    'categories:view': 'عرض الفئات',
    'categories:create': 'إضافة فئات',
    'categories:edit': 'تعديل الفئات',
    'categories:delete': 'حذف الفئات',
    'users:view': 'عرض المستخدمين',
    'users:create': 'إضافة مستخدمين',
    'users:edit': 'تعديل المستخدمين',
    'users:delete': 'حذف المستخدمين',
    'settings:view': 'عرض الإعدادات',
    'settings:edit': 'تعديل الإعدادات',
    'activity:view': 'عرض سجل النشاط',
};

export const checkPermission = (user: User | null, permission: string, permissions: Record<Role, Permission[]>): boolean => {
    if (!user) return false;
    const userPermissions = new Set(permissions[user.role] || []);
    if (!userPermissions) return false;
    return userPermissions.has(permission as Permission);
};