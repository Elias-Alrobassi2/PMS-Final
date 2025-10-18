import React, { createContext, ReactNode, useState } from 'react';
import { AppContextType, Product, Category, CategoryField, User, Settings, UserStatus, Permission, Role, ActivityLog } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';
import { initialData } from './initialData'; // Using mock data
import { permissionDescriptions, checkPermission, ROLES_HIERARCHY } from '../utils/permissions';

const roleMap: Record<Role, { label: string }> = {
  admin: { label: 'مدير' },
  manager: { label: 'مشرف' },
  user: { label: 'مستخدم' },
  viewer: { label: 'مشاهد' },
};

export const AppContext = createContext<AppContextType>({} as AppContextType);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialData.products);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', initialData.categories);
  const [categoryFields, setCategoryFields] = useLocalStorage<CategoryField[]>('categoryFields', initialData.categoryFields);
  const [users, setUsers] = useLocalStorage<User[]>('users', initialData.users);
  // FIX: Renamed the state setter from `useLocalStorage` to avoid conflict with the wrapper function below.
  const [settings, setSettingsInStorage] = useLocalStorage<Settings>('settings', initialData.settings);
  const [permissions, setPermissions] = useLocalStorage<Record<Role, Permission[]>>('permissions', initialData.permissions);
  const [activityLog, setActivityLog] = useLocalStorage<ActivityLog[]>('activityLog', initialData.activityLog);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const storedUser = sessionStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const logActivity = (action: string, user: User | null = currentUser) => {
      if (!user) return;
      const newLog: ActivityLog = {
          id: crypto.randomUUID(),
          userId: user.id,
          userName: user.name,
          action: action,
          timestamp: new Date().toISOString(),
      };
      setActivityLog(prev => [newLog, ...prev].slice(0, 200)); // Keep last 200 logs
  };

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.passwordHash === password); // Simple check for demo
    if (user) {
      if (user.status === 'suspended') {
        toast.error('هذا الحساب موقوف.');
        return false;
      }
      setCurrentUser(user);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      toast.success(`أهلاً بك مجدداً, ${user.name}!`);
      logActivity('تم تسجيل الدخول بنجاح.', user);
      return true;
    }
    return false;
  };

  const logout = () => {
    logActivity('تم تسجيل الخروج.');
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!checkPermission(currentUser, 'products:create', permissions)) {
        toast.error('ليس لديك الصلاحية لإضافة منتجات.');
        return;
    }
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    logActivity(`أضاف المنتج: ${newProduct.name}`);
    toast.success('تمت إضافة المنتج بنجاح.');
  };

  const updateProduct = (updatedProduct: Product) => {
    if (!checkPermission(currentUser, 'products:edit', permissions)) {
        toast.error('ليس لديك الصلاحية لتعديل المنتجات.');
        return;
    }
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? { ...updatedProduct, updatedAt: new Date().toISOString() } : p));
    logActivity(`حدّث المنتج: ${updatedProduct.name}`);
    toast.success('تم تحديث المنتج بنجاح.');
  };
  
  const deleteProduct = (id: string) => {
    if (!checkPermission(currentUser, 'products:delete', permissions)) {
        toast.error('ليس لديك الصلاحية لحذف المنتجات.');
        return;
    }
    const productName = products.find(p => p.id === id)?.name || 'غير معروف';
    setProducts(prev => prev.filter(p => p.id !== id));
    logActivity(`حذف المنتج: ${productName}`);
    toast.success('تم حذف المنتج.');
  };

  const deleteProducts = (ids: string[]) => {
    if (!checkPermission(currentUser, 'products:delete', permissions)) {
        toast.error('ليس لديك الصلاحية لحذف المنتجات.');
        return;
    }
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
    logActivity(`حذف ${ids.length} منتجات بشكل جماعي.`);
    toast.success(`تم حذف ${ids.length} منتجات.`);
  };

  const updateProductsCategory = (ids: string[], categoryId: string | null) => {
    if (!checkPermission(currentUser, 'products:edit', permissions)) {
        toast.error('ليس لديك الصلاحية لتعديل المنتجات.');
        return;
    }
    const categoryName = categories.find(c => c.id === categoryId)?.name || 'بدون فئة';
    setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, categoryId, updatedAt: new Date().toISOString() } : p));
    logActivity(`غير فئة ${ids.length} منتجات إلى '${categoryName}'.`);
    toast.success(`تم تغيير فئة ${ids.length} منتجات.`);
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    if (!checkPermission(currentUser, 'categories:create', permissions)) {
        toast.error('ليس لديك الصلاحية لإضافة فئات.');
        return;
    }
    const newCategory: Category = { ...category, id: crypto.randomUUID() };
    setCategories(prev => [...prev, newCategory]);
    logActivity(`أضاف الفئة: ${newCategory.name}`);
    toast.success('تمت إضافة الفئة.');
  };

  const updateCategory = (updatedCategory: Category) => {
    if (!checkPermission(currentUser, 'categories:edit', permissions)) {
        toast.error('ليس لديك الصلاحية لتعديل الفئات.');
        return;
    }
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    logActivity(`حدّث الفئة: ${updatedCategory.name}`);
    toast.success('تم تحديث الفئة.');
  };

  const deleteCategory = (id: string) => {
    if (!checkPermission(currentUser, 'categories:delete', permissions)) {
        toast.error('ليس لديك الصلاحية لحذف الفئات.');
        return;
    }
    const categoryName = categories.find(c => c.id === id)?.name || 'غير معروف';
    setCategories(prev => prev.filter(c => c.id !== id));
    logActivity(`حذف الفئة: ${categoryName}`);
    toast.success('تم حذف الفئة.');
  };

  const addCategoryField = (field: Omit<CategoryField, 'id' | 'key'>) => {
    if (!checkPermission(currentUser, 'categories:edit', permissions)) {
        toast.error('ليس لديك الصلاحية لتعديل حقول الفئات.');
        return;
    }
    const newField: CategoryField = {
      ...field,
      id: crypto.randomUUID(),
      key: field.label.toLowerCase().replace(/\s/g, '_') + '_' + Date.now(),
    };
    const categoryName = categories.find(c => c.id === field.categoryId)?.name || '';
    setCategoryFields(prev => [...prev, newField]);
    logActivity(`أضاف الحقل '${newField.label}' إلى الفئة '${categoryName}'.`);
    toast.success('تمت إضافة الحقل.');
  };

  const updateCategoryField = (updatedField: CategoryField) => {
    if (!checkPermission(currentUser, 'categories:edit', permissions)) {
        toast.error('ليس لديك الصلاحية لتعديل حقول الفئات.');
        return;
    }
    setCategoryFields(prev => prev.map(f => f.id === updatedField.id ? updatedField : f));
    logActivity(`حدّث الحقل: ${updatedField.label}`);
    toast.success('تم تحديث الحقل.');
  };
  
  const deleteCategoryField = (id: string) => {
    if (!checkPermission(currentUser, 'categories:delete', permissions)) {
        toast.error('ليس لديك الصلاحية لحذف حقول الفئات.');
        return;
    }
    const fieldName = categoryFields.find(f => f.id === id)?.label || 'غير معروف';
    setCategoryFields(prev => prev.filter(f => f.id !== id));
    logActivity(`حذف الحقل: ${fieldName}`);
    toast.success('تم حذف الحقل.');
  };

  const addUser = (user: Omit<User, 'id' | 'createdAt' | 'mfaEnabled' | 'mfaSecret' | 'passwordHash'> & {password: string}) => {
    if (!checkPermission(currentUser, 'users:create', permissions)) {
        toast.error('ليس لديك الصلاحية لإضافة مستخدمين.');
        return;
    }
    if (users.some(u => u.email === user.email)) {
        toast.error('البريد الإلكتروني مستخدم بالفعل.');
        throw new Error('Email already exists');
    }
    const newUser: User = {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        passwordHash: user.password, // In real app, hash this
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        mfaEnabled: false,
    };
    setUsers(prev => [...prev, newUser]);
    logActivity(`أضاف المستخدم: ${newUser.name}`);
    toast.success('تمت إضافة المستخدم.');
  };

  const updateUser = (updatedUser: User) => {
    if (!checkPermission(currentUser, 'users:edit', permissions)) {
        toast.error('ليس لديك الصلاحية لتعديل المستخدمين.');
        return;
    }
    const currentUserRoleIndex = currentUser ? ROLES_HIERARCHY.indexOf(currentUser.role) : -1;
    const targetUser = users.find(u => u.id === updatedUser.id);
    const targetUserRoleIndex = targetUser ? ROLES_HIERARCHY.indexOf(targetUser.role) : -1;

    if (currentUserRoleIndex > targetUserRoleIndex) {
        toast.error('لا يمكنك تعديل مستخدم له دور أعلى من دورك.');
        return;
    }
     if (updatedUser.id === currentUser?.id && updatedUser.role !== currentUser?.role) {
        toast.error('لا يمكنك تغيير دور حسابك الخاص.');
        return;
    }
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    logActivity(`حدّث بيانات المستخدم: ${updatedUser.name}`);
    toast.success('تم تحديث المستخدم.');
  };

  const deleteUser = (id: string) => {
    if (!checkPermission(currentUser, 'users:delete', permissions)) {
        toast.error('ليس لديك الصلاحية لحذف المستخدمين.');
        return;
    }
    const targetUser = users.find(u => u.id === id);
    if(targetUser){
        const currentUserRoleIndex = currentUser ? ROLES_HIERARCHY.indexOf(currentUser.role) : -1;
        const targetUserRoleIndex = ROLES_HIERARCHY.indexOf(targetUser.role);
        if (currentUserRoleIndex > targetUserRoleIndex) {
            toast.error('لا يمكنك حذف مستخدم له دور أعلى من دورك.');
            return;
        }
    }
    const userName = users.find(u => u.id === id)?.name || 'غير معروف';
    setUsers(prev => prev.filter(u => u.id !== id));
    logActivity(`حذف المستخدم: ${userName}`);
    toast.success('تم حذف المستخدم.');
  };

  const deleteUsers = (ids: string[]) => {
    if (!checkPermission(currentUser, 'users:delete', permissions)) {
        toast.error('ليس لديك الصلاحية لحذف المستخدمين.');
        return;
    }
    const currentUserRoleIndex = currentUser ? ROLES_HIERARCHY.indexOf(currentUser.role) : -1;
    const usersToDelete = users.filter(u => ids.includes(u.id));
    for(const user of usersToDelete) {
        if(ROLES_HIERARCHY.indexOf(user.role) < currentUserRoleIndex) {
            toast.error(`لا يمكنك حذف المستخدم '${user.name}' لأنه يمتلك دورًا أعلى.`);
            return;
        }
    }
    setUsers(prev => prev.filter(u => !ids.includes(u.id)));
    logActivity(`حذف ${ids.length} مستخدمين بشكل جماعي.`);
    toast.success(`تم حذف ${ids.length} مستخدمين.`);
  };
  
  const updateUsersStatus = (ids: string[], status: UserStatus) => {
    if (!checkPermission(currentUser, 'users:edit', permissions)) {
        toast.error('ليس لديك الصلاحية لتعديل المستخدمين.');
        return;
    }
    setUsers(prev => prev.map(u => ids.includes(u.id) ? {...u, status} : u));
    const statusText = status === 'active' ? 'تفعيل' : 'إيقاف';
    logActivity(`${statusText} ${ids.length} مستخدمين.`);
    toast.success(`تم تحديث حالة ${ids.length} مستخدمين.`);
  }
  
  // FIX: This function now correctly wraps the state setter from useLocalStorage, adding permission checks.
  const setSettings = (value: Settings | ((val: Settings) => Settings)) => {
      if (!checkPermission(currentUser, 'settings:edit', permissions)) {
          toast.error('ليس لديك الصلاحية لتعديل الإعدادات.');
          return;
      }
      setSettingsInStorage(value);
      logActivity(`قام بتغيير الإعدادات.`);
  }

  const updatePermission = (role: Role, permission: Permission, granted: boolean) => {
    const currentUserRoleIndex = currentUser ? ROLES_HIERARCHY.indexOf(currentUser.role) : -1;
    const targetRoleIndex = ROLES_HIERARCHY.indexOf(role);
    if (currentUserRoleIndex > targetRoleIndex) {
        toast.error('لا يمكنك تعديل صلاحيات دور أعلى من دورك.');
        return;
    }
    setPermissions(prev => {
        const currentPermissions = new Set(prev[role]);
        if (granted) {
            currentPermissions.add(permission);
        } else {
            currentPermissions.delete(permission);
        }
        const permissionText = permissionDescriptions[permission] || permission;
        const roleText = roleMap[role].label;
        const actionText = granted ? 'منح' : 'سحب';
        logActivity(`${actionText} صلاحية '${permissionText}' من دور '${roleText}'.`);
        return { ...prev, [role]: Array.from(currentPermissions) };
    });
    toast.success('تم تحديث الصلاحية.');
  };

  const backupData = () => {
    if (!checkPermission(currentUser, 'settings:edit', permissions)) {
        toast.error('ليس لديك الصلاحية لإنشاء نسخة احتياطية.');
        return;
    }
    const data = { products, categories, categoryFields, users, settings, permissions, activityLog };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity('أنشأ نسخة احتياطية للبيانات.');
    toast.success('تم إنشاء النسخة الاحتياطية.');
  };

  const restoreData = (file: File): Promise<void> => {
     if (!checkPermission(currentUser, 'settings:edit', permissions)) {
        toast.error('ليس لديك الصلاحية لاستعادة نسخة احتياطية.');
        return Promise.reject(new Error('Permission denied'));
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setProducts(data.products || []);
          setCategories(data.categories || []);
          setCategoryFields(data.categoryFields || []);
          setUsers(data.users || []);
          setSettingsInStorage(data.settings || initialData.settings);
          setPermissions(data.permissions || initialData.permissions);
          setActivityLog(data.activityLog || []);
          logActivity('استعاد البيانات من نسخة احتياطية.');
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const contextValue: AppContextType = {
    products, categories, categoryFields, users, settings, currentUser, permissions, activityLog,
    login, logout,
    addProduct, updateProduct, deleteProduct, deleteProducts, updateProductsCategory,
    addCategory, updateCategory, deleteCategory,
    addCategoryField, updateCategoryField, deleteCategoryField,
    addUser, updateUser, deleteUser, deleteUsers, updateUsersStatus,
    setSettings,
    updatePermission,
    backupData, restoreData
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};