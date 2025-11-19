'use client';

import { useState, useMemo } from 'react';
import { SortOption, Collection } from '@/types/store';
import { useProducts } from '@/hooks/useProducts';
import { sortProducts } from '@/lib/product-sorting';
import { CartProvider } from '@/contexts/CartContext';
import Header from './store/Header';
import ArtistSection from './store/ArtistSection';
import ProductFilters from './store/ProductFilters';
import ProductGrid from './store/ProductGrid';
import Pagination from './store/Pagination';
import Footer from './store/Footer';
import LoadingState from './store/LoadingState';
import ErrorState from './store/ErrorState';
import CartDrawer from './store/CartDrawer';

interface MerchStoreProps {
  publicToken: string;
  domain: string;
}

const ITEMS_PER_PAGE = 12;

export default function MerchStore({ publicToken, domain }: MerchStoreProps) {
  const { products, loading, error } = useProducts(publicToken);
  const [collections] = useState<Collection[]>([]);
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

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Header />

      <main className="max-w-[1955px] mx-auto px-8 py-12">
        <ArtistSection />

        <ProductFilters
          sortBy={sortBy}
          onSortChange={setSortBy}
          hideSoldOut={hideSoldOut}
          onHideSoldOutChange={setHideSoldOut}
        />

        <ProductGrid products={paginatedProducts} domain={domain} publicToken={publicToken} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredProducts.length}
          onPageChange={setCurrentPage}
        />
      </main>

      <Footer />
      <CartDrawer domain={domain} />
    </div>
  );
}

