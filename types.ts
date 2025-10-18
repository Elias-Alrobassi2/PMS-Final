
export type Page = 'dashboard' | 'products' | 'categories' | 'settings';

export type Theme = 'light' | 'dark';
export type AccentColor = 'blue' | 'green' | 'purple' | 'red';
export type Currency = 'SAR' | 'USD' | 'YER';
export type CalendarType = 'gregorian' | 'hijri';

export enum FieldType {
  SHORT_TEXT = 'نص قصير',
  LONG_TEXT = 'نص طويل',
  DROPDOWN = 'قائمة منسدلة',
  RADIO = 'اختيار من متعدد',
  CHECKBOX = 'مربع اختيار',
  NUMBER = 'رقم',
  DATE = 'تاريخ',
}

export interface Settings {
  theme: Theme;
  accentColor: AccentColor;
  currency: Currency;
  calendar: CalendarType;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryField {
  id: string;
  categoryId: string;
  label: string;
  key: string;
  type: FieldType;
  options: string[];
  required: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string | null;
  unit: string;
  price: number;
  quantity: number;
  description: string;
  image?: string; // base64 string
  dynamicFields: Record<string, any>; // { [field.key]: value }
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  products: Product[];
  categories: Category[];
  categoryFields: CategoryField[];
  settings: Settings;
}

export interface AppContextType extends AppState {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  
  setCategoryFields: React.Dispatch<React.SetStateAction<CategoryField[]>>;
  addCategoryField: (field: Omit<CategoryField, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategoryField: (field: CategoryField) => void;
  deleteCategoryField: (fieldId: string) => void;

  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;

  backupData: () => void;
  importData: (file: File) => Promise<boolean>;
  resetData: () => void;
}
