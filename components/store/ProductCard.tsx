'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/store';
import { getLowestPrice, formatPrice } from '@/lib/store-utils';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, domain, publicToken } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const price = getLowestPrice(product);
  const mainImage = product.images[0];
  
  // Check if product has available stock
  const hasStock = product.variants.some(variant => {
    if (variant.stock.type === 'UNLIMITED') return true;
    if (variant.stock.type === 'LIMITED' && variant.stock.inStock && variant.stock.inStock > 0) return true;
    return false;
  });

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasStock) return;
    
    // Find the first available variant
    const availableVariant = product.variants.find(variant => {
      if (variant.stock.type === 'UNLIMITED') return true;
      if (variant.stock.type === 'LIMITED' && variant.stock.inStock && variant.stock.inStock > 0) return true;
      return false;
    });
    
    if (!availableVariant) return;
    
    setIsAdding(true);
    try {
      await addItem(availableVariant.id, 1);
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group cursor-pointer block">
      <Link 
        href={`/product/${product.slug}?public_token=${publicToken}&domain=${domain}`}
      >
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
          
          {/* Add to Cart Button - Shows on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !hasStock}
              className="w-full py-2 bg-white text-black font-medium rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              {isAdding ? 'Adding...' : !hasStock ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>
        </div>
      </Link>
      
      <h3 className="text-sm font-medium mb-2 line-clamp-2">
        {product.name}
      </h3>
      {price && (
        <p className="text-sm text-gray-400">
          {formatPrice(price.value, price.currency)}
        </p>
      )}
    </div>
  );
}
