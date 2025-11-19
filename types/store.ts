export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  variants: Array<{
    id: string;
    unitPrice: {
      value: number;
      currency: string;
    };
    stock: {
      type: 'UNLIMITED' | 'LIMITED';
      inStock?: number;
    };
  }>;
  images: Array<{
    id: string;
    transformedUrl: string;
    url: string;
    width: number;
    height: number;
  }>;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
}

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

