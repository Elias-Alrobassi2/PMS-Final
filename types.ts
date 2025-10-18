
export type Page = 'dashboard' | 'products' | 'categories' | 'users' | 'settings' | 'activity';

export type Currency = 'SAR' | 'USD' | 'YER';
export type AccentColor = 'blue' | 'green' | 'purple' | 'red';
export type Theme = 'light' | 'dark' | 'system';
export type CalendarType = 'gregorian' | 'hijri';

export interface Settings {
  currency: Currency;
  accentColor: AccentColor;
  theme: Theme;
  calendar: CalendarType;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string | null;
  price: number;
  quantity: number;
  unit: string;
  description: string;
  image: string; // base64 string
  dynamicFields: Record<string, any>;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export enum FieldType {
    SHORT_TEXT = 'نص قصير',
    LONG_TEXT = 'نص طويل',
    NUMBER = 'رقم',
    DATE = 'تاريخ',
    CHECKBOX = 'مربع اختيار',
    DROPDOWN = 'قائمة منسدلة',
    RADIO = 'اختيار من متعدد',
}

export interface CategoryField {
    id: string;
    key: string;
    categoryId: string;
    label: string;
    type: FieldType;
    options: string[]; // for dropdown or radio
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export type Role = 'admin' | 'manager' | 'user' | 'viewer';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  createdAt: string; // ISO string
  mfaEnabled: boolean;
  mfaSecret?: string;
}

export type Permission = 
    'dashboard:view' |
    'products:view' | 'products:create' | 'products:edit' | 'products:delete' |
    'categories:view' | 'categories:create' | 'categories:edit' | 'categories:delete' |
    'users:view' | 'users:create' | 'users:edit' | 'users:delete' |
    'settings:view' | 'settings:edit' |
    'activity:view';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string; // ISO string
}

export interface AppContextType {
  // State
  products: Product[];
  categories: Category[];
  categoryFields: CategoryField[];
  users: User[];
  settings: Settings;
  currentUser: User | null;
  permissions: Record<Role, Permission[]>;
  activityLog: ActivityLog[];

  // Auth
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  // Products
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;
  updateProductsCategory: (ids: string[], categoryId: string | null) => void;

  // Categories
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  
  // Category Fields
  addCategoryField: (field: Omit<CategoryField, 'id' | 'key'>) => void;
  updateCategoryField: (field: CategoryField) => void;
  deleteCategoryField: (id: string) => void;

  // Users
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'mfaEnabled' | 'mfaSecret' | 'passwordHash'> & {password: string}) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  deleteUsers: (ids: string[]) => void;
  updateUsersStatus: (ids: string[], status: UserStatus) => void;
  
  // Settings
  setSettings: (value: Settings | ((val: Settings) => Settings)) => void;
  
  // Permissions
  updatePermission: (role: Role, permission: Permission, granted: boolean) => void;

  // Backup
  backupData: () => void;
  restoreData: (file: File) => Promise<void>;
}
