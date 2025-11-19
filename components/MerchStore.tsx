'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  variants: Array<{
    id: string;
    unitPrice: {
      value: number;
      currency: string;
    };
    stock: {
      type: string;
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

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface MerchStoreProps {
  publicToken: string;
}

export default function MerchStore({ publicToken }: MerchStoreProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [hideSoldOut, setHideSoldOut] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch collections first
        const collectionsRes = await fetch(
          `https://storefront-api.fourthwall.com/v1/collections?storefront_token=${publicToken}`
        );
        
        if (!collectionsRes.ok) {
          throw new Error('Failed to fetch collections');
        }
        
        const collectionsData = await collectionsRes.json();
        setCollections(collectionsData.collections || []);
        
        // If there are collections, fetch products from the first one
        if (collectionsData.collections && collectionsData.collections.length > 0) {
          const firstCollectionId = collectionsData.collections[0].id;
          setSelectedCollection(firstCollectionId);
          
          const productsRes = await fetch(
            `https://storefront-api.fourthwall.com/v1/collections/${firstCollectionId}/products?storefront_token=${publicToken}`
          );
          
          if (!productsRes.ok) {
            throw new Error('Failed to fetch products');
          }
          
          const productsData = await productsRes.json();
          setProducts(productsData.products || []);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    fetchData();
  }, [publicToken]);

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    if (!hideSoldOut) return true;
    
    // Check if any variant is in stock
    return product.variants.some(variant => {
      if (variant.stock.type === 'unlimited') return true;
      if (variant.stock.type === 'limited' && variant.stock.inStock && variant.stock.inStock > 0) return true;
      return false;
    });
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg text-red-400 mb-4">Error: {error}</p>
          <p className="text-sm text-gray-400">
            Failed to load store data. Please check your token and try again.
          </p>
        </div>
      </div>
    );
  }

  const getLowestPrice = (product: Product) => {
    if (product.variants.length === 0) return null;
    const lowest = Math.min(...product.variants.map(v => v.unitPrice.value));
    return {
      value: lowest,
      currency: product.variants[0].unitPrice.currency
    };
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="border-b border-[#282828] px-8 py-4">
        <div className="max-w-[1955px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <div className="flex items-center gap-6">
            <button className="hover:text-gray-300 transition">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button className="hover:text-gray-300 transition">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="hover:text-gray-300 transition">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1955px] mx-auto px-8 py-12">
        {/* Artist Section */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl font-bold">
            FW
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Merch by</p>
            <h1 className="text-6xl font-bold">
              {collections.length > 0 ? collections[0].name : 'Fourthwall Store'}
            </h1>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#282828] text-white px-4 py-2 rounded border border-[#404040] hover:border-white transition cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={hideSoldOut}
              onChange={(e) => setHideSoldOut(e.target.checked)}
              className="w-5 h-5 rounded accent-green-500 cursor-pointer"
            />
            <span className="text-sm group-hover:text-green-500 transition">
              Hide sold out items
            </span>
          </label>
        </div>

        {/* Products Grid */}
        {paginatedProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No products available</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {paginatedProducts.map((product) => {
                const price = getLowestPrice(product);
                const mainImage = product.images[0];
                
                return (
                  <div key={product.id} className="group cursor-pointer">
                    <div className="aspect-square bg-[#282828] rounded-lg overflow-hidden mb-4 relative">
                      {mainImage ? (
                        <Image
                          src={mainImage.transformedUrl || mainImage.url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium mb-2 line-clamp-2 group-hover:underline">
                      {product.name}
                    </h3>
                    {price && (
                      <p className="text-sm text-gray-400">
                        ${price.value.toFixed(2)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#282828] pt-8">
                <p className="text-sm text-gray-400">
                  {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} of{' '}
                  {filteredProducts.length}
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-[#282828] rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-[#282828] rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#282828] mt-20">
        <div className="max-w-[1955px] mx-auto px-8 py-12">
          <p className="text-xs text-gray-500 mb-6">
            By clicking "Buy it now" you will leave the Spotify service and be redirected to a third party's page. 
            Any activity on their page will be subject to their terms and conditions and privacy policy. They may provide 
            Spotify with your order details, which we may use to better understand your interests to improve our products 
            and offerings, in accordance with Spotify's Privacy Policy. Links and information about this item, including 
            pricing and currency, are from the merchandise seller and subject to change. Sellers may charge additional fees, 
            which may vary. While supplies last.
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Legal</a>
              <a href="#" className="hover:text-white transition">Privacy Center</a>
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Cookies</a>
              <a href="#" className="hover:text-white transition">About Ads</a>
            </div>
            <p>© 2025 Spotify AB</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

