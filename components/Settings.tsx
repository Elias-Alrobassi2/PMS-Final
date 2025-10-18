import React, { useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { CURRENCIES, THEME_COLORS } from '../constants';
import { AccentColor, CalendarType, Currency, Page, Theme } from '../types';
import { ChevronLeftIcon } from './Icons';

interface SettingsProps {
  setActivePage: (page: Page) => void;
}

const Settings: React.FC<SettingsProps> = ({ setActivePage }) => {
  const { settings, updateSetting, backupData, importData, resetData } = useContext(AppContext);
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (window.confirm("سيؤدي استيراد ملف جديد إلى الكتابة فوق جميع بياناتك الحالية. هل أنت متأكد من المتابعة؟")) {
        await importData(file);
      }
    }
  };

  const handleReset = () => {
    if (window.confirm("تحذير: سيتم حذف جميع المنتجات والفئات بشكل نهائي. لا يمكن التراجع عن هذا الإجراء. هل أنت متأكد؟")) {
      resetData();
    }
  };
  
  const storageInfo = () => {
      let total = 0;
      for(let x in localStorage) {
          if(!localStorage.hasOwnProperty(x)) continue;
          let size = ((localStorage[x].length + x.length) * 2);
          total += size;
      }
      return (total / 1024).toFixed(2) + ' KB';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">الإعدادات</h1>
      
      {/* System Management */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold border-b pb-3 dark:border-gray-600">إدارة النظام</h2>
        <p className="text-gray-600 dark:text-gray-300">
            يمكنك إدارة الهيكل الأساسي لبياناتك من هنا. قم بتنظيم الفئات أو استعراض المنتجات.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <button 
              onClick={() => setActivePage('categories')} 
              className="w-full flex justify-between items-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-start"
            >
              <div>
                <h3 className="font-bold text-lg">إدارة الفئات</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">تحكم بالهيكل الشجري للفئات والحقول المخصصة.</p>
              </div>
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setActivePage('products')} 
              className="w-full flex justify-between items-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-start"
            >
              <div>
                <h3 className="font-bold text-lg">إدارة المنتجات</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">استعراض وتعديل جميع المنتجات في المخزون.</p>
              </div>
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-bold border-b pb-3 dark:border-gray-600">المظهر</h2>
        
        {/* Theme */}
        <div className="flex items-center justify-between">
          <label className="font-medium">السمة (Theme)</label>
          <div className="flex items-center gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
            <button onClick={() => updateSetting('theme', 'light')} className={`px-4 py-1 rounded-full text-sm ${settings.theme === 'light' ? 'bg-white dark:bg-gray-500 shadow' : ''}`}>فاتح</button>
            <button onClick={() => updateSetting('theme', 'dark')} className={`px-4 py-1 rounded-full text-sm ${settings.theme === 'dark' ? 'bg-black text-white shadow' : ''}`}>داكن</button>
          </div>
        </div>
        
        {/* Accent Color */}
        <div className="flex items-center justify-between">
            <label className="font-medium">اللون الأساسي</label>
            <div className="flex items-center gap-3">
                {THEME_COLORS.map(color => (
                    <button 
                        key={color.name}
                        onClick={() => updateSetting('accentColor', color.name)}
                        className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${settings.accentColor === color.name ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                        style={{ backgroundColor: color.hex, '--tw-ring-color': color.hex } as React.CSSProperties}
                        aria-label={color.label}
                    />
                ))}
            </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-bold border-b pb-3 dark:border-gray-600">إعدادات عامة</h2>
        
        {/* Currency */}
        <div className="flex items-center justify-between">
            <label htmlFor="currency-select" className="font-medium">العملة</label>
            <select 
                id="currency-select"
                value={settings.currency} 
                onChange={e => updateSetting('currency', e.target.value as Currency)}
                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
        </div>

        {/* Calendar */}
        <div className="flex items-center justify-between">
            <label htmlFor="calendar-select" className="font-medium">نظام التقويم</label>
            <select 
                id="calendar-select"
                value={settings.calendar} 
                onChange={e => updateSetting('calendar', e.target.value as CalendarType)}
                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
                <option value="gregorian">ميلادي</option>
                <option value="hijri">هجري</option>
            </select>
        </div>
      </div>
      
      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-bold border-b pb-3 dark:border-gray-600">إدارة البيانات</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={backupData} className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 transition-colors">
                إنشاء نسخة احتياطية
            </button>
            <button onClick={handleImportClick} className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors">
                استيراد بيانات
            </button>
            <input type="file" ref={importFileRef} onChange={handleFileImport} accept=".json" className="hidden"/>
        </div>
         <button onClick={handleReset} className="w-full bg-red-500 text-white p-3 rounded hover:bg-red-600 transition-colors">
            إعادة تعيين البيانات
        </button>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
            <p>إصدار النظام: 1.0.0</p>
            <p>مساحة التخزين المستخدمة: {storageInfo()}</p>
        </div>
      </div>

      {/* Future Features */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold border-b pb-3 dark:border-gray-600">ميزات مستقبلية</h2>
        <p className="text-gray-600 dark:text-gray-300">
            نعمل باستمرار على تطوير النظام. الميزات التالية قيد التطوير وسيتم إضافتها في الإصدارات القادمة:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>إدارة المستخدمين والصلاحيات.</li>
            <li>نظام إشعارات وتنبيهات متقدم.</li>
            <li>الربط مع قواعد بيانات خارجية ومزامنة سحابية.</li>
        </ul>
      </div>

    </div>
  );
};

export default Settings;