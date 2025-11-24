'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/store';
import { useCart } from './CartContext';

interface ProductDetailContextType {
  product: Product | null;
  relatedProducts: Product[];
  loading: boolean;
  selectedVariant: Product['variants'][0] | null;
  selectedColor: string | null;
  selectedSize: string | null;
  quantity: number;
  selectedImageIndex: number;
  isAddingToCart: boolean;
  displayImages: Product['images'];
  isVariantAvailable: boolean;
  setSelectedColor: (color: string | null) => void;
  setSelectedSize: (size: string | null) => void;
  setQuantity: (quantity: number) => void;
  setSelectedImageIndex: (index: number) => void;
  handleAddToCart: () => Promise<void>;
  handleBuyNow: () => void;
}

const ProductDetailContext = createContext<ProductDetailContextType | undefined>(undefined);

export function ProductDetailProvider({
  children,
  slug,
}: {
  children: ReactNode;
  slug: string;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Product['variants'][0] | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem, publicToken, domain } = useCart();

  // Fetch product and related products
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch the specific product by slug
        const productRes = await fetch(
          `https://storefront-api.fourthwall.com/v1/products/${slug}?storefront_token=${publicToken}`
        );
        
        if (!productRes.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const productData = await productRes.json();
        setProduct(productData);
        setSelectedVariant(productData.variants[0]);
        
        // Initialize color and size from first variant
        if (productData.variants[0]) {
          setSelectedColor(productData.variants[0].attributes.color?.name || null);
          setSelectedSize(productData.variants[0].attributes.size?.name || null);
        }

        // Fetch related products (all products to filter out the current one)
        const relatedRes = await fetch(
          `https://storefront-api.fourthwall.com/v1/collections/all/products?storefront_token=${publicToken}&limit=6`
        );
        
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          const allProducts = relatedData.results || [];
          // Filter out current product and limit to 5
          const filteredRelated = allProducts
            .filter((p: Product) => p.id !== productData.id)
            .slice(0, 5);
          setRelatedProducts(filteredRelated);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setLoading(false);
      }
    }

    fetchData();
  }, [publicToken, slug]);

  // Update selected variant when color or size changes
  useEffect(() => {
    if (!product || !selectedColor || !selectedSize) return;
    
    const matchingVariant = product.variants.find(v => 
      v.attributes.color?.name === selectedColor && 
      v.attributes.size?.name === selectedSize
    );
    
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  }, [selectedColor, selectedSize, product]);

  // Reset image index when variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariant]);

  // Get images to display: variant images if available, otherwise product images
  const displayImages = selectedVariant?.images && selectedVariant.images.length > 0 
    ? selectedVariant.images 
    : product?.images || [];

  // Check if selected variant has available stock
  const isVariantAvailable = selectedVariant ? (
    selectedVariant.stock.type === 'UNLIMITED' ||
    (selectedVariant.stock.type === 'LIMITED' && !!selectedVariant.stock.inStock && selectedVariant.stock.inStock > 0)
  ) : false;

  const handleAddToCart = async () => {
    if (!selectedVariant || !isVariantAvailable) return;
    
    setIsAddingToCart(true);
    try {
      await addItem(selectedVariant.id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    const productUrl = `https://${domain}/products/${slug}`;
    window.open(productUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <ProductDetailContext.Provider
      value={{
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
      }}
    >
      {children}
    </ProductDetailContext.Provider>
  );
}

export function useProductDetail() {
  const context = useContext(ProductDetailContext);
  if (context === undefined) {
    throw new Error('useProductDetail must be used within a ProductDetailProvider');
  }
  return context;
}
