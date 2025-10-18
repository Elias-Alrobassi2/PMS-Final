
import React, { useState, useContext } from 'react';
// FIX: Corrected import paths
import { AppContext } from '../context/AppContext';
import { Category, CategoryField, FieldType } from '../types';
import { PlusIcon, EditIcon, TrashIcon, FolderOpenIcon } from './Icons';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { checkPermission } from '../utils/permissions';

const CategoryItem: React.FC<{
  category: Category;
  level: number;
  onSelect: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isSelected: boolean;
  selectedCategoryId: string | null;
}> = ({ category, level, onSelect, onEdit, onDelete, isSelected, selectedCategoryId }) => {
  const { categories, products, currentUser, permissions } = useContext(AppContext);
  const children = categories.filter(c => c.parentId === category.id);

  const productCount = products.filter(p => {
    let currentCatId = p.categoryId;
    while(currentCatId) {
      if (currentCatId === category.id) return true;
      const parent = categories.find(c => c.id === currentCatId);
      currentCatId = parent ? parent.parentId : null;
    }
    return false;
  }).length;
  
  const canModify = checkPermission(currentUser, 'categories:edit', permissions);
  const canDeleteCategoryCheck = checkPermission(currentUser, 'categories:delete', permissions);
  const canDeleteCategory = canDeleteCategoryCheck && children.length === 0 && productCount === 0;

  return (
    <>
      <div
        onClick={() => onSelect(category)}
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
          isSelected ? 'bg-accent-blue/10' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
        }`}
        style={{ paddingRight: `${level * 20 + 12}px` }}
      >
        <div className="flex-grow truncate">
            <span className="font-semibold">{category.name}</span>
            <span className="text-xs text-gray-500 me-2"> ({productCount})</span>
        </div>
        {(canModify || canDeleteCategory) && (
            <div className="flex items-center gap-2 flex-shrink-0">
                {canModify && <button onClick={(e) => { e.stopPropagation(); onEdit(category); }} className="p-1 text-gray-400 hover:text-accent-blue"><EditIcon className="w-4 h-4" /></button>}
                {canDeleteCategoryCheck && <button onClick={(e) => { e.stopPropagation(); onDelete(category); }} disabled={!canDeleteCategory} className={`p-1 text-gray-400 ${canDeleteCategory ? 'hover:text-red-500' : 'cursor-not-allowed opacity-50'}`} title={!canDeleteCategory ? "لا يمكن حذف الفئة لأنها تحتوي على فئات فرعية أو منتجات" : "حذف"}><TrashIcon className="w-4 h-4" /></button>}
            </div>
        )}
      </div>
      {children.map(child => (
        <CategoryItem key={child.id} category={child} level={level + 1} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} isSelected={selectedCategoryId === child.id} selectedCategoryId={selectedCategoryId} />
      ))}
    </>
  );
};


const Categories: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory, categoryFields, addCategoryField, updateCategoryField, deleteCategoryField, currentUser, permissions } = useContext(AppContext);
    
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [catModalMode, setCatModalMode] = useState<'add' | 'edit'>('add');
    const [fieldModalMode, setFieldModalMode] = useState<'add' | 'edit'>('add');
    const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
    const [currentField, setCurrentField] = useState<Partial<CategoryField>>({type: FieldType.SHORT_TEXT, options: []});
    
    const rootCategories = categories.filter(c => c.parentId === null);
    
    const canCreate = checkPermission(currentUser, 'categories:create', permissions);
    const canModifyFields = checkPermission(currentUser, 'categories:edit', permissions);
    const canDeleteFields = checkPermission(currentUser, 'categories:delete', permissions);

    // Category Modal Logic
    const openCatModal = (mode: 'add' | 'edit', category?: Category) => {
        setCatModalMode(mode);
        setCurrentCategory(category || { parentId: selectedCategory?.id || null });
        setIsCatModalOpen(true);
    };

    const handleCatSubmit = () => {
        if (!currentCategory.name) { toast.error("اسم الفئة مطلوب"); return; }
        if (catModalMode === 'add') {
            addCategory({ name: currentCategory.name, parentId: currentCategory.parentId || null });
        } else {
            updateCategory(currentCategory as Category);
        }
        setIsCatModalOpen(false);
    };

    const handleDeleteCategory = (category: Category) => {
        if (window.confirm(`هل أنت متأكد من حذف الفئة "${category.name}"؟`)) {
            deleteCategory(category.id);
            if (selectedCategory?.id === category.id) {
                setSelectedCategory(null);
            }
        }
    };
    
    // Field Modal Logic
    const openFieldModal = (mode: 'add' | 'edit', field?: CategoryField) => {
        setFieldModalMode(mode);
        setCurrentField(field || { categoryId: selectedCategory!.id, type: FieldType.SHORT_TEXT, options: [] });
        setIsFieldModalOpen(true);
    };

    const handleFieldSubmit = () => {
        if (!currentField.label) { toast.error("اسم الحقل مطلوب"); return; }
        const fieldData = { ...currentField };
        if (fieldData.type !== FieldType.DROPDOWN && fieldData.type !== FieldType.RADIO) {
            fieldData.options = [];
        }
        
        if (fieldModalMode === 'add') {
            addCategoryField(fieldData as Omit<CategoryField, 'id' | 'key'>);
        } else {
            updateCategoryField(fieldData as CategoryField);
        }
        setIsFieldModalOpen(false);
    };

    const fieldsForSelectedCategory = selectedCategory ? categoryFields.filter(f => f.categoryId === selectedCategory.id) : [];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">الفئات</h2>
                {canCreate && <button onClick={() => openCatModal('add')} className="flex items-center gap-2 bg-accent-blue text-white p-2 px-4 rounded-md text-sm"><PlusIcon className="w-4 h-4"/> إضافة فئة</button>}
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-1">
                {rootCategories.map(cat => (
                    <CategoryItem 
                        key={cat.id} 
                        category={cat} 
                        level={0} 
                        onSelect={setSelectedCategory} 
                        onEdit={(c) => openCatModal('edit', c)} 
                        onDelete={handleDeleteCategory}
                        isSelected={selectedCategory?.id === cat.id} 
                        selectedCategoryId={selectedCategory?.id || null}
                    />
                ))}
            </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">الحقول المخصصة</h2>
                {canModifyFields && <button onClick={() => openFieldModal('add')} disabled={!selectedCategory} className="flex items-center gap-2 bg-accent-blue text-white p-2 px-4 rounded-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"><PlusIcon className="w-4 h-4"/> إضافة حقل</button>}
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md min-h-[300px]">
                {selectedCategory ? (
                    fieldsForSelectedCategory.length > 0 ? (
                        <div className="space-y-3">
                            {fieldsForSelectedCategory.map(field => (
                                <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                    <div>
                                        <span className="font-semibold">{field.label}</span>
                                        <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full me-2">{field.type}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canModifyFields && <button onClick={() => openFieldModal('edit', field)} className="p-1 text-gray-400 hover:text-accent-blue"><EditIcon className="w-4 h-4" /></button>}
                                        {canDeleteFields && <button onClick={() => deleteCategoryField(field.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-10">
                            <h3 className="text-lg font-semibold">لا توجد حقول مخصصة</h3>
                            <p className="text-gray-500 mt-1">أضف حقولاً لهذه الفئة لتفاصيل أكثر عن المنتجات.</p>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <FolderOpenIcon className="w-16 h-16 text-gray-300 dark:text-gray-600"/>
                        <p className="mt-4 font-semibold">الرجاء تحديد فئة</p>
                        <p className="text-sm">اختر فئة من القائمة لعرض أو إضافة حقول مخصصة لها.</p>
                    </div>
                )}
            </div>
        </div>

        {isCatModalOpen && (
            <Modal title={catModalMode === 'add' ? 'إضافة فئة جديدة' : 'تعديل الفئة'} isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">اسم الفئة</label>
                        <input type="text" value={currentCategory.name || ''} onChange={e => setCurrentCategory(p => ({ ...p, name: e.target.value }))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">الفئة الرئيسية (اختياري)</label>
                        <select value={currentCategory.parentId || ''} onChange={e => setCurrentCategory(p => ({ ...p, parentId: e.target.value || null }))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="">بدون</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsCatModalOpen(false)} className="bg-gray-200 text-gray-800 p-2 px-4 rounded-md">إلغاء</button>
                    <button onClick={handleCatSubmit} className="bg-accent-blue text-white p-2 px-4 rounded-md">حفظ</button>
                </div>
            </Modal>
        )}
        
        {isFieldModalOpen && (
            <Modal title={fieldModalMode === 'add' ? 'إضافة حقل جديد' : 'تعديل الحقل'} isOpen={isFieldModalOpen} onClose={() => setIsFieldModalOpen(false)}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">اسم الحقل (Label)</label>
                        <input type="text" value={currentField.label || ''} onChange={e => setCurrentField(p => ({ ...p, label: e.target.value }))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">نوع الحقل</label>
                        <select value={currentField.type} onChange={e => setCurrentField(p => ({ ...p, type: e.target.value as FieldType }))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                           {Object.values(FieldType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    {(currentField.type === FieldType.DROPDOWN || currentField.type === FieldType.RADIO) && (
                        <div>
                            <label className="block text-sm font-medium mb-1">الخيارات (افصل بينها بفاصلة)</label>
                             <input type="text" value={currentField.options?.join(',') || ''} onChange={e => setCurrentField(p => ({...p, options: e.target.value.split(',')}))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                    )}
                </div>
                 <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsFieldModalOpen(false)} className="bg-gray-200 text-gray-800 p-2 px-4 rounded-md">إلغاء</button>
                    <button onClick={handleFieldSubmit} className="bg-accent-blue text-white p-2 px-4 rounded-md">حفظ</button>
                </div>
            </Modal>
        )}
      </div>
    );
};

export default Categories;
