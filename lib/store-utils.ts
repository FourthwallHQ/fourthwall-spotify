import { Product } from '@/types/store';

export function getLowestPrice(product: Product) {
  if (product.variants.length === 0) return null;
  const lowest = Math.min(...product.variants.map(v => v.unitPrice.value));
  return {
    value: lowest,
    currency: product.variants[0].unitPrice.currency
  };
}

export function formatPrice(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
}
