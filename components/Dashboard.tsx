
import React, { useContext, useMemo } from 'react';
// FIX: Corrected import paths
import { AppContext } from '../context/AppContext';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { BoxIcon, CategoryIcon, DollarIcon, LowStockIcon, PlusCircleIcon, FolderOpenIcon, DownloadIcon, ChartBarIcon } from './Icons';
import { Page } from '../types';

interface DashboardProps {
    setActivePage: (page: Page) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string; onClick?: () => void }> = ({ icon, title, value, color, onClick }) => (
  <div onClick={onClick} className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-s-4 border-s-4 ${color} ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
      <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  </div>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
    </button>
);


const Dashboard: React.FC<DashboardProps> = ({ setActivePage }) => {
  const { products, categories, settings, backupData } = useContext(AppContext);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalRootCategories = categories.filter(c => c.parentId === null).length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= 5);
    const outOfStockProducts = products.filter(p => p.quantity === 0);
    
    const productsPerCategory = categories
        .filter(c => c.parentId === null)
        .map(cat => ({
            ...cat,
            count: products.filter(p => {
                let currentCat = categories.find(c => c.id === p.categoryId);
                while(currentCat) {
                    if (currentCat.id === cat.id) return true;
                    currentCat = categories.find(c => c.id === currentCat?.parentId);
                }
                return false;
            }).length
        }))
        .filter(cat => cat.count > 0)
        .sort((a,b) => b.count - a.count);

    return { totalProducts, totalRootCategories, totalValue, lowStockProducts, outOfStockProducts, productsPerCategory };
  }, [products, categories]);
  
  const maxCategoryCount = Math.max(1, ...stats.productsPerCategory.map(c => c.count));

  return (
    <div className="space-y-6">
      
      {/* Welcome and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">أهلاً بك مجدداً!</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">هنا نظرة سريعة على حالة مخزونك اليوم.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
              <QuickActionButton icon={<PlusCircleIcon className="w-6 h-6 text-green-500"/>} label="إضافة منتج" onClick={() => setActivePage('products')} />
              <QuickActionButton icon={<FolderOpenIcon className="w-6 h-6 text-yellow-500"/>} label="إدارة الفئات" onClick={() => setActivePage('categories')} />
              <QuickActionButton icon={<DownloadIcon className="w-6 h-6 text-blue-500"/>} label="نسخ احتياطي" onClick={backupData} />
          </div>
      </div>


      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<BoxIcon className="text-blue-500" />} 
          title="إجمالي المنتجات" 
          value={formatNumber(stats.totalProducts)}
          color="border-blue-500"
          onClick={() => setActivePage('products')}
        />
        <StatCard 
          icon={<CategoryIcon className="text-green-500" />} 
          title="الفئات الرئيسية" 
          value={formatNumber(stats.totalRootCategories)}
          color="border-green-500"
          onClick={() => setActivePage('categories')}
        />
        <StatCard 
          icon={<DollarIcon className="text-purple-500" />} 
          title="قيمة المخزون" 
          value={formatCurrency(stats.totalValue, settings.currency)}
          color="border-purple-500"
        />
        <StatCard 
          icon={<LowStockIcon className="text-red-500" />} 
          title="مخزون منخفض" 
          value={formatNumber(stats.lowStockProducts.length)}
          color="border-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts & Graphs */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ChartBarIcon/> توزيع المنتجات حسب الفئة</h2>
            <div className="space-y-3">
            {stats.productsPerCategory.length > 0 ? stats.productsPerCategory.map(cat => (
                <div key={cat.id} className="grid grid-cols-4 items-center gap-2 text-sm">
                    <span className="col-span-1 font-semibold truncate" title={cat.name}>{cat.name}</span>
                    <div className="col-span-3 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                        <div 
                            className="bg-accent-blue h-6 rounded-full flex items-center justify-end px-2 text-white text-xs font-bold"
                            style={{ width: `${(cat.count / maxCategoryCount) * 100}%`}}
                        >
                          {formatNumber(cat.count)}
                        </div>
                    </div>
                </div>
            )) : <p className="text-gray-500 text-center py-8">لا توجد منتجات مصنفة لعرض الرسم البياني.</p>}
            </div>
        </div>

        {/* Alerts & Activity */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-2">تنبيهات المخزون</h2>
            {stats.lowStockProducts.length > 0 ? (
                 <ul className="space-y-2 text-sm max-h-40 overflow-y-auto custom-scrollbar">
                     {stats.lowStockProducts.map(p => (
                         <li key={p.id} className="flex justify-between items-center p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20">
                             <span className="font-semibold">{p.name}</span>
                             <span className="text-yellow-600 dark:text-yellow-400 font-bold">{formatNumber(p.quantity)}</span>
                         </li>
                     ))}
                 </ul>
            ) : <p className="text-sm text-gray-500">لا توجد منتجات ذات مخزون منخفض.</p>}
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-bold mb-2 border-t dark:border-gray-700 pt-4">آخر التحديثات</h2>
            {[...products].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3).map(product => (
              <div key={product.id} className="flex items-center space-s-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                   {product.image ? <img src={product.image} alt={product.name} className="w-10 h-10 rounded-full object-cover"/> : <BoxIcon className="w-10 h-10 text-gray-400"/>}
                   <div>
                     <p className="font-semibold text-sm">{product.name}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(product.updatedAt).toLocaleDateString('ar-SA')}</p>
                   </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
