import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Product, Category } from '../types';
import { formatCurrency, formatNumber } from '../utils/helpers';
import ProductModal from './ProductModal';
import { BoxIcon, EditIcon, TrashIcon, ViewIcon, PlusIcon, FilterIcon, ChevronDownIcon } from './Icons';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
  const { products, deleteProduct, categories, settings } = useContext(AppContext);
  
  // State for Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const getCategoryPath = (categoryId: string | null): Category[] => {
    if (!categoryId) return [];
    const path: Category[] = [];
    let current = categories.find(c => c.id === categoryId);
    while(current) {
        path.unshift(current);
        current = categories.find(c => c.id === current?.parentId);
    }
    return path;
  }

  const filteredProducts = useMemo(() => {
    const minPrice = parseFloat(priceFilter.min) || 0;
    const maxPrice = parseFloat(priceFilter.max) || Infinity;

    return products
      .filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(p => {
        if (categoryFilter === 'all') return true;
        const path = getCategoryPath(p.categoryId);
        return path.some(cat => cat.id === categoryFilter);
      })
      .filter(p => p.price >= minPrice && p.price <= maxPrice)
      .filter(p => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'available') return p.quantity > 5;
        if (statusFilter === 'low') return p.quantity > 0 && p.quantity <= 5;
        if (statusFilter === 'out') return p.quantity === 0;
        return true;
      });
  }, [products, searchTerm, categoryFilter, priceFilter, statusFilter, categories]);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setPriceFilter({ min: '', max: '' });
    setStatusFilter('all');
    toast.success("تمت إعادة تعيين الفلاتر.");
  };

  const openModal = (mode: 'add' | 'edit' | 'view', product?: Product) => {
    setModalMode(mode);
    setSelectedProduct(product || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSwitchMode = (newMode: 'add' | 'edit', product: Product) => {
    setModalMode(newMode);
    setSelectedProduct(product);
  };

  const handleDelete = (productId: string) => {
    if(window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProduct(productId);
    }
  }
  
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'غير مصنف';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'غير معروف';
  };

  const renderCategoryOptions = (parentId: string | null = null, depth = 0) => {
    return categories
      .filter(c => c.parentId === parentId)
      .flatMap(c => [
        <option key={c.id} value={c.id}>
          {'--'.repeat(depth)} {c.name}
        </option>,
        ...renderCategoryOptions(c.id, depth + 1)
      ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">المنتجات ({filteredProducts.length})</h1>
        <button
            onClick={() => openModal('add')}
            className="flex items-center justify-center gap-2 bg-accent-blue text-white p-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
            <PlusIcon /> إضافة منتج
        </button>
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
        <div className="flex gap-4 items-center">
            <input 
              type="text"
              placeholder="ابحث بالاسم أو الكود (SKU)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <button 
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="lg:hidden p-2 bg-gray-200 dark:bg-gray-700 rounded-md"
            >
                <FilterIcon />
            </button>
        </div>

        <div className={`${isFiltersVisible ? 'block' : 'hidden'} lg:grid lg:grid-cols-4 gap-4 space-y-4 lg:space-y-0 border-t pt-4 dark:border-gray-700`}>
           {/* Category Filter */}
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                <option value="all">كل الفئات</option>
                {renderCategoryOptions()}
            </select>
            
            {/* Price Filter */}
            <div className="flex gap-2">
                <input type="number" placeholder="أقل سعر" value={priceFilter.min} onChange={e => setPriceFilter(p => ({...p, min: e.target.value}))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <input type="number" placeholder="أعلى سعر" value={priceFilter.max} onChange={e => setPriceFilter(p => ({...p, max: e.target.value}))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            </div>

            {/* Status Filter */}
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                <option value="all">كل الحالات</option>
                <option value="available">متوفر</option>
                <option value="low">مخزون منخفض</option>
                <option value="out">نفد المخزون</option>
            </select>

             {/* Reset Button */}
            <button onClick={resetFilters} className="w-full bg-gray-200 dark:bg-gray-600 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">إعادة تعيين</button>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                 {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover"/>
                 ) : (
                    <BoxIcon className="w-16 h-16 text-gray-400" />
                 )}
                 {product.quantity === 0 ? <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">نفد</span> : product.quantity <= 5 ? <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">منخفض</span> : null}
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-lg truncate" title={product.name}>{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{getCategoryName(product.categoryId)}</p>
                <div className="mt-2 flex-grow">
                    <span className="text-xs font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{product.sku}</span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <p className="text-xl font-bold text-accent-blue">{formatCurrency(product.price, settings.currency)}</p>
                    <p className="text-sm">{`الكمية: ${formatNumber(product.quantity)}`}</p>
                </div>
              </div>
               <div className="p-2 bg-gray-50 dark:bg-gray-700/50 grid grid-cols-3 gap-1">
                  <button onClick={() => openModal('view', product)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md flex items-center justify-center gap-1 text-xs"><ViewIcon className="w-4 h-4" /> عرض</button>
                  <button onClick={() => openModal('edit', product)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md flex items-center justify-center gap-1 text-xs"><EditIcon className="w-4 h-4" /> تعديل</button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md flex items-center justify-center gap-1 text-xs"><TrashIcon className="w-4 h-4" /> حذف</button>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <BoxIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto"/>
            <h2 className="mt-4 text-xl font-semibold">{searchTerm || categoryFilter !== 'all' ? 'لا توجد منتجات تطابق البحث' : 'لا توجد منتجات'}</h2>
            <p className="text-gray-500 mt-2">{searchTerm || categoryFilter !== 'all' ? 'جرّب تعديل الفلاتر أو إعادة تعيينها.' : 'ابدأ بإضافة منتجك الأول!'}</p>
             <button
                onClick={() => openModal('add')}
                className="mt-6 flex items-center justify-center gap-2 bg-accent-blue text-white p-2 px-4 rounded-md hover:bg-blue-700 transition-colors mx-auto"
            >
                <PlusIcon /> إضافة منتج جديد
            </button>
        </div>
      )}

      {isModalOpen && (
        <ProductModal 
          mode={modalMode}
          product={selectedProduct}
          onClose={closeModal}
          onSwitchMode={handleSwitchMode}
        />
      )}
    </div>
  );
};

export default Products;
