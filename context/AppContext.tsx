
import React, { createContext, ReactNode } from 'react';
import { AppState, AppContextType, Product, Category, CategoryField, Settings } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';

const initialState: AppState = {
  products: [],
  categories: [],
  categoryFields: [],
  settings: {
    theme: 'light',
    accentColor: 'blue',
    currency: 'SAR',
    calendar: 'gregorian',
  },
};

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialState.products);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', initialState.categories);
  const [categoryFields, setCategoryFields] = useLocalStorage<CategoryField[]>('categoryFields', initialState.categoryFields);
  const [settings, setSettings] = useLocalStorage<Settings>('settings', initialState.settings);

  // Product functions
  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    toast.success('تمت إضافة المنتج بنجاح!');
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? { ...updatedProduct, updatedAt: new Date().toISOString() } : p));
    toast.success('تم تحديث المنتج بنجاح!');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.success('تم حذف المنتج بنجاح!');
  };

  // Category functions
  const addCategory = (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCategories(prev => [...prev, newCategory]);
    toast.success('تمت إضافة الفئة بنجاح!');
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? { ...updatedCategory, updatedAt: new Date().toISOString() } : c));
    toast.success('تم تحديث الفئة بنجاح!');
  };

  const deleteCategory = (categoryId: string) => {
    const allCategories = categories;
    const allFields = categoryFields;
    
    // Find all descendant categories
    const idsToDelete = [categoryId];
    const queue = [categoryId];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = allCategories.filter(c => c.parentId === currentId);
      for (const child of children) {
        idsToDelete.push(child.id);
        queue.push(child.id);
      }
    }

    const isUsed = products.some(p => p.categoryId && idsToDelete.includes(p.categoryId));
    if (isUsed) {
        toast.error("لا يمكن حذف الفئة لأنها أو أحد فروعها مستخدمة في بعض المنتجات.");
        return;
    }
    
    // Delete categories and their fields
    setCategories(prev => prev.filter(c => !idsToDelete.includes(c.id)));
    setCategoryFields(prev => prev.filter(f => !idsToDelete.includes(f.categoryId)));
    toast.success('تم حذف الفئة وجميع فروعها بنجاح!');
  };

  // Category Field functions
  const addCategoryField = (field: Omit<CategoryField, 'id' | 'createdAt' | 'updatedAt'>) => {
     const newField: CategoryField = {
      ...field,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCategoryFields(prev => [...prev, newField]);
    toast.success('تمت إضافة الحقل بنجاح!');
  };

  const updateCategoryField = (updatedField: CategoryField) => {
    setCategoryFields(prev => prev.map(f => f.id === updatedField.id ? { ...updatedField, updatedAt: new Date().toISOString() } : f));
    toast.success('تم تحديث الحقل بنجاح!');
  };

  const deleteCategoryField = (fieldId: string) => {
    // Check if the field's key is used in any product's dynamicFields
    const fieldToDelete = categoryFields.find(f => f.id === fieldId);
    if (!fieldToDelete) return;

    const isUsed = products.some(p => Object.keys(p.dynamicFields).includes(fieldToDelete.key));
    if (isUsed) {
        toast.error("لا يمكن حذف الحقل لأنه مستخدم في بعض المنتجات.");
        return;
    }
    setCategoryFields(prev => prev.filter(f => f.id !== fieldId));
    toast.success('تم حذف الحقل بنجاح!');
  };

  // Settings functions
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  // Data management functions
  const backupData = () => {
    const data: AppState = { products, categories, categoryFields, settings };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('تم إنشاء نسخة احتياطية بنجاح!');
  };

  const importData = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text) as AppState;
          // Basic validation for the new structure
          if (data.products && data.categories && data.categoryFields && data.settings) {
            setProducts(data.products);
            setCategories(data.categories);
            setCategoryFields(data.categoryFields);
            setSettings(data.settings);
            toast.success('تم استيراد البيانات بنجاح!');
            resolve(true);
          } else {
            throw new Error("ملف غير صالح أو لا يطابق البنية الجديدة.");
          }
        } catch (error) {
          toast.error("فشل استيراد البيانات. تأكد من أن الملف صحيح.");
          console.error(error);
          reject(false);
        }
      };
      reader.onerror = () => {
          toast.error("فشل قراءة الملف.");
          reject(false);
      };
      reader.readAsText(file);
    });
  };

  const resetData = () => {
      setProducts(initialState.products);
      setCategories(initialState.categories);
      setCategoryFields(initialState.categoryFields);
      toast.success("تمت إعادة تعيين بيانات المنتجات والفئات.");
  };

  const value: AppContextType = {
    products, setProducts, addProduct, updateProduct, deleteProduct,
    categories, setCategories, addCategory, updateCategory, deleteCategory,
    categoryFields, setCategoryFields, addCategoryField, updateCategoryField, deleteCategoryField,
    settings, setSettings, updateSetting,
    backupData, importData, resetData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
