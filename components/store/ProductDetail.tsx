'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/store';
import { formatPrice } from '@/lib/store-utils';
import { useCart } from '@/contexts/CartContext';
import { useProductDetail } from '@/contexts/ProductDetailContext';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

interface ProductDetailProps {
  slug: string;
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const { name, publicToken, domain } = useCart();
  const {
    product,
    relatedProducts,
    loading,
    selectedVariant,
    selectedColor,
    selectedSize,
    quantity,
    selectedImageIndex,
    isAddingToCart,
    displayImages,
    isVariantAvailable,
    setSelectedColor,
    setSelectedSize,
    setQuantity,
    setSelectedImageIndex,
    handleAddToCart,
    handleBuyNow,
  } = useProductDetail();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <p className="text-lg">Product not found</p>
          <Link
            href={`/?public_token=${publicToken}&domain=${domain}&name=${name}`}
            className="text-[#1ed760] hover:underline mt-4 inline-block"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Header />

      <main className="max-w-[1955px] mx-auto px-8 py-8">
        {/* Back Button */}
        <Link
          href={`/?public_token=${publicToken}&domain=${domain}&name=${name}`}
          className="inline-flex items-center text-white hover:text-gray-300 transition mb-8"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Browse all merch</span>
        </Link>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-[#282828] rounded-lg overflow-hidden relative">
              {displayImages[selectedImageIndex] && (
                <Image
                  src={displayImages[selectedImageIndex].transformedUrl || displayImages[selectedImageIndex].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-[#282828] rounded overflow-hidden relative ${
                      selectedImageIndex === index ? 'ring-2 ring-white' : ''
                    }`}
                  >
                    <Image
                      src={image.transformedUrl || image.url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold mb-6">{product.name}</h1>
            
            {/* Artist section - placeholder */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#282828] rounded-full" />
              <span className="font-medium">Artist Name</span>
            </div>

            {product.description && (
              <div className="mb-6">
                <p className="text-gray-300 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <div className="text-2xl font-bold mb-8">
              USD {selectedVariant && formatPrice(selectedVariant.unitPrice.value, selectedVariant.unitPrice.currency)}
            </div>

            {/* Color Selection */}
            {(() => {
              const colors = Array.from(new Set(
                product.variants
                  .filter(v => v.attributes.color)
                  .map(v => JSON.stringify(v.attributes.color))
              )).map(str => JSON.parse(str));
              
              if (colors.length > 0) {
                return (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Color</label>
                    <select
                      value={selectedColor || ''}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-full bg-white text-black px-4 py-3 rounded-md font-medium cursor-pointer"
                    >
                      {colors.map((color) => {
                        const hasAvailableVariant = product.variants.some(v => 
                          v.attributes.color?.name === color.name &&
                          (v.stock.type === 'UNLIMITED' || 
                           (v.stock.type === 'LIMITED' && v.stock.inStock && v.stock.inStock > 0))
                        );
                        
                        return (
                          <option key={color.name} value={color.name}>
                            {color.name}
                            {!hasAvailableVariant && ' (Out of stock)'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              }
              return null;
            })()}

            {/* Size Selection */}
            {(() => {
              const sizes = Array.from(new Set(
                product.variants
                  .filter(v => v.attributes.size)
                  .map(v => v.attributes.size!.name)
              ));
              
              if (sizes.length > 0) {
                return (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Size</label>
                    <select
                      value={selectedSize || ''}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full bg-white text-black px-4 py-3 rounded-md font-medium cursor-pointer"
                    >
                      {sizes.map((size) => {
                        // Check if this size is available for the selected color
                        const isAvailableForColor = selectedColor 
                          ? product.variants.some(v => 
                              v.attributes.size?.name === size &&
                              v.attributes.color?.name === selectedColor &&
                              (v.stock.type === 'UNLIMITED' || 
                               (v.stock.type === 'LIMITED' && v.stock.inStock && v.stock.inStock > 0))
                            )
                          : product.variants.some(v => 
                              v.attributes.size?.name === size &&
                              (v.stock.type === 'UNLIMITED' || 
                               (v.stock.type === 'LIMITED' && v.stock.inStock && v.stock.inStock > 0))
                            );
                        
                        return (
                          <option key={size} value={size}>
                            {size}
                            {!isAvailableForColor && ' (Out of stock)'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              }
              return null;
            })()}

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">Quantity</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white text-black px-4 py-3 rounded-md font-medium cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedVariant || !isVariantAvailable}
                className="flex-1 bg-[#1ed760] text-black font-bold py-4 px-8 rounded-full hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isAddingToCart ? 'Adding...' : !isVariantAvailable ? 'Out of stock' : 'Add to cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-[#1ed760] text-black font-bold py-4 px-8 rounded-full hover:scale-105 transition"
              >
                Buy it now
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 leading-relaxed">
              By clicking "Buy it now" you will leave the Spotify service and be redirected to a third party's page. 
              Any activity on their page will be subject to their terms and conditions and privacy policy. 
              They may provide Spotify with your order details, which we may use to better understand your interests 
              to improve our products and offerings, in accordance with Spotify's Privacy Policy. Links and information 
              about this item, including pricing and currency, are from the merchandise seller and subject to change. 
              Sellers may charge additional fees, which may vary. While supplies last.
            </p>
          </div>
        </div>

        {/* More Items Section */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">More items from Artist Name</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.map((relatedProduct) => {
                const relatedPrice = relatedProduct.variants[0]?.unitPrice;
                const relatedImage = relatedProduct.images[0];
                
                return (
                  <Link
                    key={relatedProduct.id}
                    href={`/product/${relatedProduct.slug}?public_token=${publicToken}&domain=${domain}`}
                    className="group"
                  >
                    <div className="aspect-square bg-[#282828] rounded-lg overflow-hidden mb-3 relative">
                      {relatedImage && (
                        <Image
                          src={relatedImage.transformedUrl || relatedImage.url}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      )}
                    </div>
                    <h3 className="text-sm font-medium mb-1 line-clamp-2 group-hover:underline">
                      {relatedProduct.name}
                    </h3>
                    {relatedPrice && (
                      <p className="text-gray-400 text-sm">
                        {formatPrice(relatedPrice.value, relatedPrice.currency)}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer domain={domain} />
    </div>
  );
}

