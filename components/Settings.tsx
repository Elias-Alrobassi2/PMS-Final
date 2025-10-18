import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { THEME_COLORS, CURRENCIES } from '../constants';
// FIX: Imported the `Settings` type to resolve TypeScript errors.
import { AccentColor, Currency, Theme, CalendarType, Settings } from '../types';
import toast from 'react-hot-toast';
import MfaSetupModal from './MfaSetupModal';
import { checkPermission } from '../utils/permissions';

const Settings: React.FC = () => {
  const { settings, setSettings, backupData, restoreData, currentUser, permissions } = useContext(AppContext);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);

  const canEdit = checkPermission(currentUser, 'settings:edit', permissions);

  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) {
        toast.error('ليس لديك الصلاحية لاستعادة البيانات.');
        return;
    }
    const file = event.target.files?.[0];
    if (file) {
      try {
        await restoreData(file);
        toast.success('تم استعادة البيانات بنجاح.');
      } catch (error) {
        toast.error('فشل في استعادة البيانات. تأكد من أن الملف صحيح.');
      }
    }
    // Reset file input to allow re-uploading the same file
    event.target.value = '';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">الإعدادات</h1>
      
      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">الإعدادات العامة</h2>
        <div className="space-y-6">
            {/* Currency */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">العملة</label>
                <select 
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value as Currency)}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canEdit}
                >
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
            </div>
             {/* Calendar */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">التقويم</label>
                <select 
                    value={settings.calendar}
                    onChange={(e) => handleSettingChange('calendar', e.target.value as CalendarType)}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canEdit}
                >
                    <option value="gregorian">ميلادي</option>
                    <option value="hijri">هجري</option>
                </select>
            </div>
        </div>
      </div>
      
      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">المظهر</h2>
        <div className="space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">السمة</label>
            <div className="mt-2 flex gap-4">
              {(['light', 'dark', 'system'] as Theme[]).map(theme => (
                <button key={theme} onClick={() => handleSettingChange('theme', theme)} className={`px-4 py-2 rounded-md font-semibold text-sm ${settings.theme === theme ? 'bg-accent-blue text-white' : 'bg-gray-200 dark:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`} disabled={!canEdit}>
                  {theme === 'light' ? 'فاتح' : theme === 'dark' ? 'داكن' : 'النظام'}
                </button>
              ))}
            </div>
          </div>
          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">اللون الرئيسي</label>
            <div className="mt-2 flex gap-3">
              {THEME_COLORS.map(color => (
                <button key={color.name} onClick={() => handleSettingChange('accentColor', color.name as AccentColor)} className={`w-10 h-10 rounded-full border-4 ${settings.accentColor === color.name ? 'border-accent-blue' : 'border-transparent'} disabled:opacity-50 disabled:cursor-not-allowed`} style={{ backgroundColor: color.hex }} title={color.label} disabled={!canEdit} />
              ))}
            </div>
          </div>
        </div>
      </div>

       {/* Security Settings */}
       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">الأمان</h2>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">المصادقة الثنائية (MFA)</h3>
            <p className="text-sm text-gray-500">
              {currentUser?.mfaEnabled ? 'مفعلة' : 'غير مفعلة. أضف طبقة حماية إضافية لحسابك.'}
            </p>
          </div>
          <button 
            onClick={() => setIsMfaModalOpen(true)}
            className="bg-accent-blue text-white px-4 py-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!canEdit}
          >
            {currentUser?.mfaEnabled ? 'إدارة' : 'تفعيل'}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">إدارة البيانات</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <button onClick={backupData} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!canEdit}>
            نسخ احتياطي للبيانات
          </button>
          <label className={`flex-1 bg-blue-500 text-white px-4 py-2 rounded-md text-center ${canEdit ? 'hover:bg-blue-600 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}>
            استعادة البيانات
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" disabled={!canEdit}/>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">سيتم تنزيل نسخة من جميع المنتجات، الفئات، والمستخدمين في ملف JSON. يمكنك استخدام هذا الملف للاستعادة لاحقًا.</p>
      </div>

      {isMfaModalOpen && <MfaSetupModal onClose={() => setIsMfaModalOpen(false)} />}
    </div>
  );
};

export default Settings;