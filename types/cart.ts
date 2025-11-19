export interface CartItem {
  variant: {
    id: string;
    name: string;
    sku: string;
    unitPrice: {
      value: number;
      currency: string;
    };
    compareAtPrice?: {
      value: number;
      currency: string;
    };
    attributes: {
      description: string;
      color?: {
        name: string;
        swatch: string;
      };
      size?: {
        name: string;
      };
    };
    stock: {
      type: 'UNLIMITED' | 'LIMITED';
      inStock?: number;
    };
    images: Array<{
      id: string;
      url: string;
      transformedUrl: string;
      width: number;
      height: number;
    }>;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  };
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface AddToCartRequest {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
}

