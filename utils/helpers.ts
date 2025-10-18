
import { Currency } from '../types';

export const formatCurrency = (amount: number, currency: Currency): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ar-SA').format(num);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const generateSKU = (productName: string, categoryName: string): string => {
  if (!productName || !categoryName) return '';
  const catPart = categoryName.substring(0, 3).toUpperCase();
  const namePart = productName.substring(0, 3).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${catPart}-${namePart}-${randomPart}`;
};
