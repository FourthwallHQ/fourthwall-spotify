import { Product, SortOption } from '@/types/store';
import { getLowestPrice } from './store-utils';

export function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => {
        const priceA = getLowestPrice(a);
        const priceB = getLowestPrice(b);
        if (!priceA) return 1;
        if (!priceB) return -1;
        return priceA.value - priceB.value;
      });

    case 'price-high':
      return sorted.sort((a, b) => {
        const priceA = getLowestPrice(a);
        const priceB = getLowestPrice(b);
        if (!priceA) return 1;
        if (!priceB) return -1;
        return priceB.value - priceA.value;
      });

    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case 'newest':
    default:
      return sorted;
  }
}
