
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Product } from '../types';
import { formatCurrency, formatNumber } from '../utils/helpers';
import ProductModal from './ProductModal';
import { BoxIcon, EditIcon, TrashIcon, ViewIcon, PlusIcon } from './Icons';

const Products: React.FC = () => {
  const { products, deleteProduct, categories, settings } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">المنتجات</h1>
        <button
            onClick={() => openModal('add')}
            className="hidden md:flex items-center justify-center gap-2 bg-accent-blue text-white p-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
            <PlusIcon /> إضافة منتج
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <input 
          type="text"
          placeholder="ابحث بالاسم أو الكود (SKU)..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                 {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover"/>
                 ) : (
                    <BoxIcon className="w-16 h-16 text-gray-400" />
                 )}
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{getCategoryName(product.categoryId)}</p>
                <div className="mt-2 flex-grow">
                    <span className="text-xs font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{product.sku}</span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <p className="text-lg font-bold text-accent-blue">{formatCurrency(product.price, settings.currency)}</p>
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
            <h2 className="mt-4 text-xl font-semibold">لا توجد منتجات</h2>
            <p className="text-gray-500 mt-2">ابدأ بإضافة منتجك الأول!</p>
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
