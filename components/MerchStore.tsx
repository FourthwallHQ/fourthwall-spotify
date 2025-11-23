'use client';

import { ProductsProvider, useProductsContext } from '@/contexts/ProductsContext';
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

function MerchStoreContent({ domain }: { domain: string }) {
  const {
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
    totalItems,
  } = useProductsContext();

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

        <ProductGrid products={paginatedProducts} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </main>

      <Footer />
      <CartDrawer domain={domain} />
    </div>
  );
}

export default function MerchStore({ publicToken, domain }: MerchStoreProps) {
  return (
    <ProductsProvider publicToken={publicToken}>
      <MerchStoreContent domain={domain} />
    </ProductsProvider>
  );
}
