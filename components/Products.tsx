import React, { useState, useMemo, useContext } from 'react';
// FIX: Corrected import paths
import { AppContext } from '../context/AppContext';
import { Product, Category } from '../types';
import ProductModal from './ProductModal';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { renderHijriDate } from '../utils/dateUtils';
import { PlusIcon, EditIcon, TrashIcon, BoxIcon, SearchIcon, GridIcon, ListIcon } from './Icons';
import { checkPermission } from '../utils/permissions';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
    const { products, categories, deleteProduct, deleteProducts, updateProductsCategory, settings, currentUser, permissions } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    
    const canCreate = checkPermission(currentUser, 'products:create', permissions);
    const canEdit = checkPermission(currentUser, 'products:edit', permissions);
    const canDelete = checkPermission(currentUser, 'products:delete', permissions);

    const filteredProducts = useMemo(() => {
        let filtered = products;
        if (searchTerm) {
             filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (filterCategory !== 'all') {
            const childCategoryIds = (catId: string): string[] => {
                const children = categories.filter(c => c.parentId === catId).map(c => c.id);
                return [catId, ...children.flatMap(childId => childCategoryIds(childId))];
            };
            const allCatIds = childCategoryIds(filterCategory);
            filtered = filtered.filter(p => p.categoryId && allCatIds.includes(p.categoryId));
        }
        return filtered;
    }, [products, searchTerm, filterCategory, categories]);
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredProducts.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
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

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} منتجات؟`)) {
            deleteProducts(selectedIds);
            setSelectedIds([]);
        }
    };
    
    const handleBulkCategoryChange = (categoryId: string | null) => {
        if (selectedIds.length === 0) return;
        updateProductsCategory(selectedIds, categoryId === 'null' ? null : categoryId);
        setSelectedIds([]);
        setShowCategoryModal(false);
    };

    // FIX: Add `handleSwitchMode` to allow the ProductModal to switch from 'view' to 'edit' mode.
    const handleSwitchMode = (newMode: 'add' | 'edit', product: Product) => {
        setModalMode(newMode);
        setSelectedProduct(product);
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">إدارة المنتجات ({filteredProducts.length})</h1>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    {canCreate && (
                        <button onClick={() => openModal('add')} className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-accent-blue text-white p-2 px-4 rounded-md hover:bg-blue-700">
                            <PlusIcon /> إضافة منتج
                        </button>
                    )}
                     <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-md">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-accent-blue text-white' : 'text-gray-600 dark:text-gray-300'}`}><GridIcon /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-accent-blue text-white' : 'text-gray-600 dark:text-gray-300'}`}><ListIcon /></button>
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <input type="text" placeholder="ابحث بالاسم أو الكود..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 ps-10 border rounded dark:bg-gray-700 dark:border-gray-600"/>
                    <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                </div>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                    <option value="all">كل الفئات</option>
                    {renderCategoryOptions()}
                </select>
            </div>

            {selectedIds.length > 0 && (canEdit || canDelete) && (
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg flex items-center justify-between gap-4">
                    <span className="font-semibold">{selectedIds.length} منتجات محددة</span>
                    <div className="flex gap-2">
                        {canEdit && <button onClick={() => setShowCategoryModal(true)} className="bg-yellow-500 text-white px-3 py-1 text-sm rounded-md">تغيير الفئة</button>}
                        {canDelete && <button onClick={handleBulkDelete} className="bg-red-500 text-white px-3 py-1 text-sm rounded-md">حذف</button>}
                    </div>
                </div>
            )}
            
            {filteredProducts.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative">
                                {(canEdit || canDelete) && <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => handleSelectOne(product.id)} className="absolute top-2 right-2 z-10 rounded" />}
                                <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer" onClick={() => openModal('view', product)}>
                                     {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover"/> : <BoxIcon className="w-16 h-16 text-gray-400"/>}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg truncate">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{categories.find(c=>c.id === product.categoryId)?.name || 'غير مصنف'}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="font-bold text-accent-blue text-lg">{formatCurrency(product.price, settings.currency)}</span>
                                        <span className="text-sm font-semibold">{formatNumber(product.quantity)} {product.unit}</span>
                                    </div>
                                    {(canEdit || canDelete) && (
                                        <div className="flex gap-2 mt-4 border-t pt-3 dark:border-gray-700">
                                            {canEdit && <button onClick={() => openModal('edit', product)} className="flex-1 text-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600">تعديل</button>}
                                            {canDelete && <button onClick={() => { if(window.confirm('هل أنت متأكد؟')) deleteProduct(product.id) }} className="flex-1 text-center bg-red-50 text-red-600 p-2 rounded-md text-sm font-semibold hover:bg-red-100">حذف</button>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    {(canEdit || canDelete) && <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} className="rounded" /></th>}
                                    <th scope="col" className="px-6 py-3">المنتج</th>
                                    <th scope="col" className="px-6 py-3">الكود</th>
                                    <th scope="col" className="px-6 py-3">الفئة</th>
                                    <th scope="col" className="px-6 py-3">السعر</th>
                                    <th scope="col" className="px-6 py-3">الكمية</th>
                                    <th scope="col" className="px-6 py-3">آخر تحديث</th>
                                    {(canEdit || canDelete) && <th scope="col" className="px-6 py-3 text-center">إجراءات</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 ${selectedIds.includes(product.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
                                        {(canEdit || canDelete) && <td className="p-4"><input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => handleSelectOne(product.id)} className="rounded" /></td>}
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white cursor-pointer" onClick={() => openModal('view', product)}>
                                            <div className="flex items-center gap-3">
                                                {product.image ? <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover"/> : <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><BoxIcon className="w-6 h-6 text-gray-400"/></div>}
                                                <span className={product.description ? 'border-b border-dotted' : ''} title={product.description}>{product.name}</span>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4 font-mono">{product.sku}</td>
                                        <td className="px-6 py-4">{categories.find(c => c.id === product.categoryId)?.name || 'غير مصنف'}</td>
                                        <td className="px-6 py-4">{formatCurrency(product.price, settings.currency)}</td>
                                        <td className="px-6 py-4">{formatNumber(product.quantity)} {product.unit}</td>
                                        <td className="px-6 py-4">{renderHijriDate(product.updatedAt, settings.calendar)}</td>
                                        {(canEdit || canDelete) && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {canEdit && <button onClick={() => openModal('edit', product)} className="p-2 text-gray-500 hover:text-accent-blue" title="تعديل"><EditIcon/></button>}
                                                    {canDelete && <button onClick={() => { if(window.confirm('هل أنت متأكد؟')) deleteProduct(product.id) }} className="p-2 text-red-500 hover:text-red-700" title="حذف"><TrashIcon/></button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <BoxIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto"/>
                    <h2 className="mt-4 text-xl font-semibold">لا توجد منتجات</h2>
                    <p className="text-gray-500 mt-2">ابدأ بإضافة منتجك الأول أو قم بتعديل فلاتر البحث.</p>
                </div>
            )}
            
            {isModalOpen && <ProductModal mode={modalMode} product={selectedProduct} onClose={closeModal} onSwitchMode={handleSwitchMode} canEdit={canEdit} />}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">تغيير الفئة لـ {selectedIds.length} منتجات</h3>
                        <select onChange={(e) => handleBulkCategoryChange(e.target.value)} defaultValue="" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 mb-4">
                            <option value="" disabled>اختر فئة جديدة...</option>
                            <option value="null">إزالة الفئة</option>
                            {renderCategoryOptions()}
                        </select>
                        <button onClick={() => setShowCategoryModal(false)} className="bg-gray-200 text-gray-800 p-2 px-4 rounded-md w-full">إلغاء</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;