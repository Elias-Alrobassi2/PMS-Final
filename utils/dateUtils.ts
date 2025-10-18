
import { CalendarType } from '../types';

// Simple Hijri date formatter as a fallback since a library cannot be added.
// This is an approximation and might not be perfectly accurate.
// For a real app, a library like `moment-hijri` is recommended.
const toHijri = (date: Date): string => {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth() + 1;
  const gDay = date.getDate();
  
  const hYear = Math.round((gYear - 622) * 33 / 32);
  // This is a very rough estimation.
  const hMonth = gMonth;
  const hDay = gDay;

  return `${hYear}/${hMonth}/${hDay}`;
};

export const renderHijriDate = (date: Date | string, calendarType: CalendarType): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if(isNaN(dateObj.getTime())) return 'تاريخ غير صالح';

  if (calendarType === 'hijri') {
    // In a real project, use a reliable library here.
    // For now, using a simple Intl formatter if available, otherwise fallback to estimation
    try {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
            year: 'numeric', month: 'long', day: 'numeric'
        }).format(dateObj);
    } catch (e) {
        return toHijri(dateObj);
    }
  } else {
    return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric', month: 'long', day: 'numeric'
    }).format(dateObj);
  }
};
