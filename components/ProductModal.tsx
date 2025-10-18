
import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Product, Category, CategoryField, FieldType } from '../types';
import { fileToBase64, generateSKU } from '../utils/helpers';
import { renderHijriDate } from '../utils/dateUtils';
import Modal from './Modal';
import { EditIcon, CameraIcon, BoxIcon } from './Icons';
import toast from 'react-hot-toast';

interface ProductModalProps {
  mode: 'add' | 'edit' | 'view';
  product?: Product | null;
  onClose: () => void;
  onSwitchMode: (newMode: 'add' | 'edit', product: Product) => void;
}

const emptyProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  sku: '',
  categoryId: null,
  unit: '',
  price: 0,
  quantity: 0,
  description: '',
  image: '',
  dynamicFields: {},
};

const ProductModal: React.FC<ProductModalProps> = ({ mode, product, onClose, onSwitchMode }) => {
  const { addProduct, updateProduct, categories, categoryFields, settings } = useContext(AppContext);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>(emptyProduct);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && product) {
      setFormData({ ...product });
      setImagePreview(product.image);
    } else {
      setFormData(emptyProduct);
      setImagePreview(undefined);
    }
  }, [product, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
  };

  const handleDynamicFieldChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: {
        ...prev.dynamicFields,
        [fieldKey]: value,
      },
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("حجم الصورة يجب أن يكون أقل من 2 ميجابايت.");
        return;
      }
      const base64 = await fileToBase64(file);
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, image: base64 }));
    }
  };
  
  const handleGenerateSKU = () => {
    const category = categories.find(c => c.id === formData.categoryId);
    if(formData.name && category) {
      setFormData(prev => ({...prev, sku: generateSKU(formData.name, category.name)}));
    } else {
      toast.error('الرجاء إدخال اسم المنتج واختيار فئة أولاً.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'edit' && product) {
      updateProduct({ ...product, ...formData });
    } else if (mode === 'add') {
      addProduct(formData);
    }
    onClose();
  };
  
  const getCategoryPath = (categoryId: string | null): Category[] => {
    if (!categoryId) return [];
    let path = [];
    let current = categories.find(c => c.id === categoryId);
    while(current) {
        path.unshift(current);
        current = categories.find(c => c.id === current?.parentId);
    }
    return path;
  }

  const getRelevantFields = (): CategoryField[] => {
      const path = getCategoryPath(formData.categoryId);
      const categoryIds = path.map(c => c.id);
      return categoryFields.filter(f => categoryIds.includes(f.categoryId));
  };
  
  const relevantFields = getRelevantFields();

  const formInputClasses = "w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-accent-blue focus:border-accent-blue";
  const formLabelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

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

  const renderField = (field: CategoryField) => {
    const value = formData.dynamicFields[field.key];

    switch (field.type) {
      case FieldType.SHORT_TEXT:
        return <input type="text" value={value || ''} onChange={e => handleDynamicFieldChange(field.key, e.target.value)} className={formInputClasses} />;
      case FieldType.LONG_TEXT:
        return <textarea value={value || ''} onChange={e => handleDynamicFieldChange(field.key, e.target.value)} className={formInputClasses} rows={3}></textarea>;
      case FieldType.NUMBER:
        return <input type="number" value={value || ''} onChange={e => handleDynamicFieldChange(field.key, parseFloat(e.target.value))} className={formInputClasses} />;
      case FieldType.DATE:
        return <input type="date" value={value || ''} onChange={e => handleDynamicFieldChange(field.key, e.target.value)} className={formInputClasses} />;
      case FieldType.CHECKBOX:
        return <input type="checkbox" checked={!!value} onChange={e => handleDynamicFieldChange(field.key, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-blue focus:ring-accent-blue" />;
      case FieldType.DROPDOWN:
      case FieldType.RADIO: // Render radio as dropdown for simplicity in this view
        return (
          <select value={value || ''} onChange={e => handleDynamicFieldChange(field.key, e.target.value)} className={formInputClasses}>
            <option value="">اختر...</option>
            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      default:
        return null;
    }
  };

  const title = mode === 'add' ? 'إضافة منتج جديد' : mode === 'edit' ? 'تعديل المنتج' : 'تفاصيل المنتج';
  
  const btnPrimaryClasses = "flex items-center justify-center gap-2 bg-accent-blue text-white p-2 px-4 rounded-md hover:bg-blue-700 transition-colors";
  const btnSecondaryClasses = "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors";


  if (mode === 'view' && product) {
    const categoryPath = getCategoryPath(product.categoryId).map(c => c.name).join(' > ');
    return (
      <Modal title={title} isOpen={true} onClose={onClose} size="lg">
        <div className="space-y-4">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
            {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover"/> : <BoxIcon className="w-20 h-20 text-gray-400" />}
          </div>
          <h3 className="text-2xl font-bold">{product.name}</h3>
          <p className="text-gray-500 dark:text-gray-400">{product.description || 'لا يوجد وصف.'}</p>
          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t dark:border-gray-600">
            <div><strong>الكود (SKU):</strong> <span className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">{product.sku}</span></div>
            <div><strong>الفئة:</strong> {categoryPath || 'غير مصنف'}</div>
            <div><strong>السعر:</strong> {product.price} {settings.currency}</div>
            <div><strong>الكمية:</strong> {product.quantity} {product.unit}</div>
            <div><strong>تاريخ الإنشاء:</strong> {renderHijriDate(product.createdAt, settings.calendar)}</div>
            <div><strong>آخر تحديث:</strong> {renderHijriDate(product.updatedAt, settings.calendar)}</div>
          </div>
          {relevantFields.length > 0 && (
            <div>
              <h4 className="font-bold mt-4 mb-2 border-t pt-4 dark:border-gray-600">تفاصيل إضافية</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {relevantFields.map(field => (
                  <div key={field.id}><strong>{field.label}:</strong> {product.dynamicFields[field.key]?.toString() || 'N/A'}</div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className={btnSecondaryClasses}>إغلاق</button>
          <button onClick={() => onSwitchMode('edit', product)} className={`${btnPrimaryClasses} flex items-center gap-2`}><EditIcon /> تعديل</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={title} isOpen={true} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center">
            <div 
                className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer relative group"
                onClick={() => fileInputRef.current?.click()}
            >
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover"/>
                ) : (
                    <BoxIcon className="w-16 h-16 text-gray-400"/>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all">
                    <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100"/>
                </div>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={formLabelClasses}>اسم المنتج</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={formInputClasses} required />
            </div>
            <div>
                <label className={formLabelClasses}>الفئة</label>
                <select name="categoryId" value={formData.categoryId || ''} onChange={handleChange} className={formInputClasses} required>
                    <option value="">اختر فئة</option>
                    {renderCategoryOptions()}
                </select>
            </div>
        </div>

        <div>
            <label className={formLabelClasses}>الكود (SKU)</label>
            <div className="flex gap-2">
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} className={formInputClasses} required />
                <button type="button" onClick={handleGenerateSKU} className={`${btnSecondaryClasses} whitespace-nowrap`}>إنشاء تلقائي</button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className={formLabelClasses}>السعر</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className={formInputClasses} required min="0" step="0.01"/>
            </div>
            <div>
                <label className={formLabelClasses}>الكمية</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className={formInputClasses} required min="0"/>
            </div>
            <div>
                <label className={formLabelClasses}>وحدة القياس</label>
                <input type="text" name="unit" placeholder="مثال: قطعة, كرتون" value={formData.unit} onChange={handleChange} className={formInputClasses} />
            </div>
        </div>

        <div>
            <label className={formLabelClasses}>الوصف</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className={formInputClasses} rows={3}></textarea>
        </div>
        
        {relevantFields.length > 0 && (
            <div className="space-y-4 border-t pt-4 mt-4 dark:border-gray-600">
                <h4 className="font-semibold text-lg">تفاصيل إضافية</h4>
                {relevantFields.map(field => (
                    <div key={field.id}>
                        <label className={formLabelClasses}>{field.label}</label>
                        {renderField(field)}
                    </div>
                ))}
            </div>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
          <button type="button" onClick={onClose} className={btnSecondaryClasses}>إلغاء</button>
          <button type="submit" className={btnPrimaryClasses}>{mode === 'edit' ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
