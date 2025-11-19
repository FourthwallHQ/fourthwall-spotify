'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/store';
import { formatPrice } from '@/lib/store-utils';
import { useCart } from '@/contexts/CartContext';
import Header from './Header';
import Footer from './Footer';

interface ProductDetailProps {
  slug: string;
}

export default function ProductDetail({ slug, }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Product['variants'][0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem, name, publicToken, domain } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all products
        const productsRes = await fetch(
          `https://storefront-api.fourthwall.com/v1/collections/all/products?storefront_token=${publicToken}`
        );
        
        if (!productsRes.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const productsData = await productsRes.json();
        const products = productsData.results || [];
        setAllProducts(products);
        
        // Find the specific product by slug
        const foundProduct = products.find((p: Product) => p.slug === slug);
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedVariant(foundProduct.variants[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setLoading(false);
      }
    }

    fetchData();
  }, [publicToken, slug]);

  const handleBuyNow = () => {
    const productUrl = `https://${domain}/products/${slug}`;
    window.open(productUrl, '_blank', 'noopener,noreferrer');
  };

  // Check if selected variant has available stock
  const isVariantAvailable = selectedVariant ? (
    selectedVariant.stock.type === 'UNLIMITED' ||
    (selectedVariant.stock.type === 'LIMITED' && selectedVariant.stock.inStock && selectedVariant.stock.inStock > 0)
  ) : false;

  const handleAddToCart = async () => {
    if (!selectedVariant || !isVariantAvailable) return;
    
    setIsAddingToCart(true);
    try {
      await addItem(selectedVariant.id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Optionally show an error message to the user
    } finally {
      setIsAddingToCart(false);
    }
  };

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

  // Get related products (exclude current one, limit to 5)
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id)
    .slice(0, 5);

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
              {product.images[selectedImageIndex] && (
                <Image
                  src={product.images[selectedImageIndex].transformedUrl || product.images[selectedImageIndex].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
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

            {/* Size Selection */}
            {product.variants.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Size</label>
                <select
                  value={selectedVariant?.id || ''}
                  onChange={(e) => {
                    const variant = product.variants.find(v => v.id === e.target.value);
                    if (variant) setSelectedVariant(variant);
                  }}
                  className="w-full bg-white text-black px-4 py-3 rounded-md font-medium cursor-pointer"
                >
                  {product.variants.map((variant, index) => {
                    const isAvailable = variant.stock.type === 'UNLIMITED' ||
                      (variant.stock.type === 'LIMITED' && variant.stock.inStock && variant.stock.inStock > 0);
                    return (
                      <option key={variant.id} value={variant.id}>
                        Unisex {['Small', 'Medium', 'Large', 'X-Large', '2X-Large'][index] || `Option ${index + 1}`}
                        {!isAvailable && ' (Out of stock)'}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

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
    </div>
  );
}

