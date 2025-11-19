import { useEffect, useState } from 'react';
import { Product } from '@/types/store';

export function useProducts(publicToken: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const productsRes = await fetch(
          `https://storefront-api.fourthwall.com/v1/collections/all/products?storefront_token=${publicToken}`
        );
        
        if (!productsRes.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const productsData = await productsRes.json();
        setProducts(productsData.results || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    fetchData();
  }, [publicToken]);

  return { products, loading, error };
}

