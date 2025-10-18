import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Category, CategoryField, FieldType } from '../types';
import Modal from './Modal';
import { PlusIcon, EditIcon, TrashIcon, FolderIcon, ChevronDownIcon, GearIcon, InfoCircleIcon } from './Icons';
import { FIELD_TYPE_OPTIONS } from '../constants';
import toast from 'react-hot-toast';

// --- Category Modal (for adding/editing categories) ---
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  category?: Category | null;
  parentId?: string | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, mode, category, parentId }) => {
  const { categories, addCategory, updateCategory } = useContext(AppContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && category) {
        setName(category.name);
        setDescription(category.description);
        setSelectedParentId(category.parentId);
      } else {
        setName('');
        setDescription('');
        setSelectedParentId(parentId || null);
      }
    }
  }, [isOpen, mode, category, parentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('اسم الفئة مطلوب.');
      return;
    }
    
    // Check for duplicates
    const siblingCategories = categories.filter(c => c.parentId === selectedParentId && c.id !== category?.id);
    if (siblingCategories.some(c => c.name.trim().toLowerCase() === name.trim().toLowerCase())) {
        toast.error('اسم الفئة مكرر في نفس المستوى.');
        return;
    }


    if (mode === 'edit' && category) {
      updateCategory({ ...category, name, description, parentId: selectedParentId });
    } else {
      addCategory({ name, description, parentId: selectedParentId });
    }
    onClose();
  };

  const renderCategoryOptions = (pId: string | null = null, depth = 0, disabledId: string | null = null) => {
    return categories
      .filter(c => c.parentId === pId)
      .flatMap(c => {
        if (c.id === disabledId) return [];
        return [
          <option key={c.id} value={c.id}>
            {'--'.repeat(depth)} {c.name}
          </option>,
          ...renderCategoryOptions(c.id, depth + 1, disabledId)
        ];
      });
  };

  return (
    <Modal title={mode === 'add' ? 'إضافة فئة جديدة' : 'تعديل الفئة'} isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الفئة</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={3}></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الفئة الأب</label>
          <select value={selectedParentId || ''} onChange={e => setSelectedParentId(e.target.value || null)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
            <option value="">(بدون فئة أب - رئيسية)</option>
            {renderCategoryOptions(null, 0, mode === 'edit' ? category?.id : null)}
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
          <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 px-4 rounded-md">إلغاء</button>
          <button type="submit" className="bg-accent-blue text-white p-2 px-4 rounded-md">{mode === 'edit' ? 'حفظ التعديلات' : 'إضافة الفئة'}</button>
        </div>
      </form>
    </Modal>
  );
};

// --- Fields Modal (for managing custom fields) ---
interface FieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}

const CategoryFieldsModal: React.FC<FieldsModalProps> = ({ isOpen, onClose, category }) => {
    const { categoryFields, addCategoryField, updateCategoryField, deleteCategoryField } = useContext(AppContext);
    const [fields, setFields] = useState<CategoryField[]>([]);
    const [newField, setNewField] = useState<Partial<Omit<CategoryField, 'id' | 'createdAt' | 'updatedAt'>>>({
      label: '', key: '', type: FieldType.SHORT_TEXT, options: [], required: false, categoryId: category.id
    });

    useEffect(() => {
        if(isOpen) {
            setFields(categoryFields.filter(f => f.categoryId === category.id));
        }
    }, [isOpen, category.id, categoryFields]);

    const handleFieldChange = (index: number, prop: keyof CategoryField, value: any) => {
        const updatedFields = [...fields];
        // @ts-ignore
        updatedFields[index][prop] = value;
        setFields(updatedFields);
    };

    const handleSaveField = (field: CategoryField) => {
        updateCategoryField(field);
    };

    const handleDeleteField = (fieldId: string) => {
        if (window.confirm("هل أنت متأكد من حذف هذا الحقل؟")) {
            deleteCategoryField(fieldId);
        }
    };
    
    const handleAddNewField = () => {
        if (!newField.label || !newField.key) {
            toast.error("اسم الحقل والكود مطلوبان.");
            return;
        }

        const existingKeys = categoryFields.map(f => f.key);
        if (existingKeys.includes(newField.key)) {
            toast.error("هذا الكود مستخدم مسبقًا. الرجاء اختيار كود فريد.");
            return;
        }

        addCategoryField({
            label: newField.label,
            key: newField.key,
            type: newField.type || FieldType.SHORT_TEXT,
            options: newField.options || [],
            required: newField.required || false,
            categoryId: category.id
        });
        setNewField({ label: '', key: '', type: FieldType.SHORT_TEXT, options: [], required: false, categoryId: category.id });
    };

    return (
        <Modal title={`إدارة الحقول المخصصة لـ "${category.name}"`} isOpen={isOpen} onClose={onClose} size="xl">
            <div className="space-y-4">
                <h3 className="text-lg font-bold">الحقول الحالية</h3>
                {fields.length > 0 ? (
                    <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-3 border rounded-md dark:border-gray-600 space-y-2">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <input type="text" placeholder="اسم الحقل" value={field.label} onChange={e => handleFieldChange(index, 'label', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <input type="text" placeholder="الكود (انجليزي بدون مسافات)" value={field.key} disabled className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500 text-gray-400" />
                                <select value={field.type} onChange={e => handleFieldChange(index, 'type', e.target.value as FieldType)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    {FIELD_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                             </div>
                              {(field.type === FieldType.DROPDOWN || field.type === FieldType.RADIO) && (
                                <textarea placeholder="الخيارات (كل خيار في سطر)" value={field.options.join('\n')} onChange={e => handleFieldChange(index, 'options', e.target.value.split('\n'))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={2}/>
                            )}
                             <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={field.required} onChange={e => handleFieldChange(index, 'required', e.target.checked)} /> مطلوب</label>
                                <div>
                                    <button onClick={() => handleDeleteField(field.id)} className="text-red-500 hover:underline text-sm p-1">حذف</button>
                                    <button onClick={() => handleSaveField(field)} className="text-green-500 hover:underline text-sm p-1">حفظ</button>
                                </div>
                             </div>
                        </div>
                    ))}
                    </div>
                ) : <p className="text-gray-500">لا توجد حقول مخصصة لهذه الفئة.</p>}
            </div>
             <div className="space-y-2 border-t pt-4 mt-6 dark:border-gray-600">
                <h3 className="text-lg font-bold">إضافة حقل جديد</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input type="text" placeholder="اسم الحقل" value={newField.label} onChange={e => setNewField(p => ({...p, label: e.target.value}))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <input type="text" placeholder="الكود (انجليزي)" value={newField.key} onChange={e => setNewField(p => ({...p, key: e.target.value.replace(/\s+/g, '_')}))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <select value={newField.type} onChange={e => setNewField(p => ({...p, type: e.target.value as FieldType}))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                       {FIELD_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>
                 {(newField.type === FieldType.DROPDOWN || newField.type === FieldType.RADIO) && (
                    <textarea placeholder="الخيارات (كل خيار في سطر)" value={newField.options?.join('\n')} onChange={e => setNewField(p => ({...p, options: e.target.value.split('\n')}))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={2}/>
                 )}
                 <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!newField.required} onChange={e => setNewField(p => ({...p, required: e.target.checked}))} /> مطلوب</label>
                    <button onClick={handleAddNewField} className="bg-accent-blue text-white px-4 py-2 rounded-md text-sm">إضافة الحقل</button>
                </div>
            </div>
             <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 px-4 rounded-md">إغلاق</button>
            </div>
        </Modal>
    );
};

// --- Inspector Panel ---
interface InspectorPanelProps {
    category: Category;
    onClose: () => void;
}
const InspectorPanel: React.FC<InspectorPanelProps> = ({ category, onClose }) => {
    const { categoryFields } = useContext(AppContext);
    const fields = categoryFields.filter(f => f.categoryId === category.id);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col">
            <div className="border-b dark:border-gray-600 pb-3 mb-4">
                <h2 className="text-xl font-bold truncate">{category.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">معرف: <span className="font-mono text-xs">{category.id}</span></p>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">الوصف</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{category.description || 'لا يوجد وصف.'}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">الحقول المخصصة ({fields.length})</h3>
                        {fields.length > 0 ? (
                            <ul className="mt-2 space-y-2 text-sm">
                                {fields.map(field => (
                                    <li key={field.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <span className="font-bold">{field.label}</span> ({field.type})
                                        {field.required && <span className="text-red-500 text-xs ms-2">مطلوب</span>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">لا توجد حقول مخصصة لهذه الفئة.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Categories Component ---
const Categories: React.FC = () => {
  const { categories, deleteCategory } = useContext(AppContext);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryParentId, setNewCategoryParentId] = useState<string | null>(null);

  const [isFieldsModalOpen, setIsFieldsModalOpen] = useState(false);
  const [categoryForFields, setCategoryForFields] = useState<Category | null>(null);
  
  const [inspectedCategory, setInspectedCategory] = useState<Category | null>(null);

  const categoryTree = useMemo(() => {
    const tree = new Map<string | null, Category[]>();
    categories.forEach(cat => {
        if (!tree.has(cat.parentId)) {
            tree.set(cat.parentId, []);
        }
        tree.get(cat.parentId)!.push(cat);
    });
    tree.forEach(children => children.sort((a, b) => a.name.localeCompare(b.name)));
    return tree;
  }, [categories]);

  const openAddModal = (parentId: string | null = null) => {
    setCategoryModalMode('add');
    setSelectedCategory(null);
    setNewCategoryParentId(parentId);
    setIsCategoryModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setCategoryModalMode('edit');
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };
  
  const openFieldsModal = (category: Category) => {
      setCategoryForFields(category);
      setIsFieldsModalOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع الفئات الفرعية التابعة لها أيضًا.")) {
      if (inspectedCategory?.id === categoryId) {
        setInspectedCategory(null);
      }
      deleteCategory(categoryId);
    }
  };

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    categories.forEach(c => initialState[c.id] = true);
    return initialState;
  });

  const toggleCategory = (categoryId: string) => {
      setOpenCategories(prev => ({...prev, [categoryId]: !prev[categoryId]}));
  }

  const renderCategoriesRecursive = (parentId: string | null, level: number) => {
    const children = categoryTree.get(parentId) || [];
    return children.map(category => {
        const grandChildren = categoryTree.get(category.id) || [];
        const isOpen = openCategories[category.id] ?? true;
        
        return (
            <div key={category.id}>
                <div 
                    className={`flex items-center justify-between p-2 rounded-md group cursor-pointer ${inspectedCategory?.id === category.id ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                    onClick={() => setInspectedCategory(category)}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <div style={{ paddingRight: `${level * 1.5}rem` }}></div>
                        {grandChildren.length > 0 ? (
                            <button onClick={(e) => { e.stopPropagation(); toggleCategory(category.id); }} className="p-1 z-10">
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                            </button>
                        ) : <div className="w-6"></div>}
                        <FolderIcon className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold truncate">{category.name}</span>
                        {category.description && <span className="text-xs text-gray-500 truncate hidden md:inline" title={category.description}>- {category.description}</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-100 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); openFieldsModal(category); }} className="p-2 text-gray-500 hover:text-accent-blue" title="إدارة الحقول"><GearIcon /></button>
                        <button onClick={(e) => { e.stopPropagation(); openAddModal(category.id); }} className="p-2 text-gray-500 hover:text-accent-blue" title="إضافة فئة فرعية"><PlusIcon className="w-4 h-4"/></button>
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(category); }} className="p-2 text-gray-500 hover:text-accent-blue" title="تعديل"><EditIcon /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(category.id); }} className="p-2 text-red-500 hover:text-red-700" title="حذف"><TrashIcon /></button>
                    </div>
                </div>
                 {isOpen && (
                    <div className="pr-6 border-r-2 border-gray-200 dark:border-gray-700 mr-3">
                        {renderCategoriesRecursive(category.id, level + 1)}
                    </div>
                )}
            </div>
        );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">الفئات</h1>
        <button
          onClick={() => openAddModal()}
          className="flex items-center justify-center gap-2 bg-accent-blue text-white p-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon /> إضافة فئة رئيسية
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Tree */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-2">
            {categories.length > 0 ? (
                renderCategoriesRecursive(null, 0)
            ) : (
            <div className="text-center py-16">
                <FolderIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto" />
                <h2 className="mt-4 text-xl font-semibold">لا توجد فئات</h2>
                <p className="text-gray-500 mt-2">ابدأ بإضافة فئتك الرئيسية الأولى!</p>
            </div>
            )}
        </div>
        
        {/* Inspector Panel */}
        <div className="lg:col-span-1 hidden lg:block">
            {inspectedCategory ? (
                <InspectorPanel category={inspectedCategory} onClose={() => setInspectedCategory(null)} />
            ) : (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center">
                    <InfoCircleIcon className="w-16 h-16 text-gray-300 dark:text-gray-600"/>
                    <h3 className="mt-4 font-semibold">لوحة التفاصيل</h3>
                    <p className="text-sm text-gray-500 mt-1">اختر فئة من القائمة على اليمين لعرض تفاصيلها هنا.</p>
                </div>
            )}
        </div>
      </div>


      {isCategoryModalOpen && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          mode={categoryModalMode}
          category={selectedCategory}
          parentId={newCategoryParentId}
        />
      )}
      
      {isFieldsModalOpen && categoryForFields && (
        <CategoryFieldsModal
            isOpen={isFieldsModalOpen}
            onClose={() => setIsFieldsModalOpen(false)}
            category={categoryForFields}
        />
      )}
    </div>
  );
};

export default Categories;
