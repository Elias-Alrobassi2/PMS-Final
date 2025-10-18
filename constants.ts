
import { AccentColor, Currency, FieldType } from './types';

export const CURRENCIES: { code: Currency; name: string; flag: string }[] = [
  { code: 'SAR', name: 'ريال سعودي', flag: '🇸🇦' },
  { code: 'USD', name: 'دولار أمريكي', flag: '🇺🇸' },
  { code: 'YER', name: 'ريال يمني', flag: '🇾🇪' },
];

export const THEME_COLORS: { name: AccentColor, hex: string, label: string }[] = [
    { name: 'blue', hex: '#3b82f6', label: 'أزرق' },
    { name: 'green', hex: '#10b981', label: 'أخضر' },
    { name: 'purple', hex: '#8b5cf6', label: 'بنفسجي' },
    { name: 'red', hex: '#ef4444', label: 'أحمر' },
];

export const FIELD_TYPE_OPTIONS = Object.values(FieldType);
