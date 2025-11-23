'use client';

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Product, SortOption } from '@/types/store';
import { useProducts } from '@/hooks/useProducts';
import { sortProducts } from '@/lib/product-sorting';

interface ProductsContextType {
  // Config
  publicToken: string;
  
  // Data
  products: Product[];
  filteredProducts: Product[];
  paginatedProducts: Product[];
  loading: boolean;
  error: string | null;
  
  // Filters & Sort
  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;
  hideSoldOut: boolean;
  setHideSoldOut: (hide: boolean) => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const ITEMS_PER_PAGE = 12;

interface ProductsProviderProps {
  publicToken: string;
  children: ReactNode;
}

export function ProductsProvider({ publicToken, children }: ProductsProviderProps) {
  const { products, loading, error } = useProducts(publicToken);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [hideSoldOut, setHideSoldOut] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (hideSoldOut) {
      filtered = filtered.filter(product => {
        return product.variants.some(variant => {
          if (variant.stock.type === 'UNLIMITED') return true;
          if (variant.stock.type === 'LIMITED' && variant.stock.inStock && variant.stock.inStock > 0) return true;
          return false;
        });
      });
    }
    
    return sortProducts(filtered, sortBy);
  }, [products, sortBy, hideSoldOut]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const value = {
    publicToken,
    products,
    filteredProducts,
    paginatedProducts,
    loading,
    error,
    sortBy,
    setSortBy,
    hideSoldOut,
    setHideSoldOut,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems: filteredProducts.length,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProductsContext() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
}

