'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/store';
import { getLowestPrice, formatPrice } from '@/lib/store-utils';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  domain: string;
}

export default function ProductCard({ product, domain }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const price = getLowestPrice(product);
  const mainImage = product.images[0];
  const productUrl = `https://${domain}/products/${product.slug}`;
  
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
      <a 
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
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
          {hasStock && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full py-2 bg-white text-black font-medium rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? 'Adding...' : 'Add to cart'}
              </button>
            </div>
          )}
        </div>
      </a>
      
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
