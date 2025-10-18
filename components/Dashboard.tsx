
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { BoxIcon, CategoryIcon, DollarIcon, LowStockIcon } from './Icons';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
  <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-s-4 border-s-4 ${color}`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { products, categories, settings } = useContext(AppContext);

  const totalProducts = products.length;
  const totalRootCategories = categories.filter(c => c.parentId === null).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const lowStockProducts = products.filter(p => p.quantity <= 5).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">لوحة التحكم</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<BoxIcon className="text-blue-500" />} 
          title="إجمالي المنتجات" 
          value={formatNumber(totalProducts)}
          color="border-blue-500"
        />
        <StatCard 
          icon={<CategoryIcon className="text-green-500" />} 
          title="الفئات الرئيسية" 
          value={formatNumber(totalRootCategories)}
          color="border-green-500"
        />
        <StatCard 
          icon={<DollarIcon className="text-purple-500" />} 
          title="القيمة الإجمالية للمخزون" 
          value={formatCurrency(totalValue, settings.currency)}
          color="border-purple-500"
        />
        <StatCard 
          icon={<LowStockIcon className="text-red-500" />} 
          title="منتجات تحتاج إعادة طلب" 
          value={formatNumber(lowStockProducts)}
          color="border-red-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">نصائح وإرشادات</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>ابدأ بإضافة الفئات الرئيسية من صفحة "الفئات" لتنظيم منتجاتك بشكل هرمي.</li>
          <li>استخدم الحقول المخصصة في الفئات لإضافة تفاصيل فريدة لكل نوع منتج.</li>
          <li>قم بعمل نسخة احتياطية لبياناتك بانتظام من صفحة "الإعدادات".</li>
          <li>يمكنك تخصيص مظهر التطبيق والعملة والتقويم من "الإعدادات".</li>
        </ul>
      </div>

       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">آخر النشاطات</h2>
        {products.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">لا يوجد نشاطات لعرضها. أضف منتجك الأول!</p>
        ) : (
          <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
            {[...products].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5).map(product => (
              <li key={product.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center space-s-3">
                   {product.image ? <img src={product.image} alt={product.name} className="w-10 h-10 rounded-full object-cover"/> : <BoxIcon className="w-10 h-10 text-gray-400"/>}
                   <div>
                     <p className="font-semibold">{product.name}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">آخر تحديث: {new Date(product.updatedAt).toLocaleString('ar-SA')}</p>
                   </div>
                </div>
                <span className="text-sm font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{product.sku}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
