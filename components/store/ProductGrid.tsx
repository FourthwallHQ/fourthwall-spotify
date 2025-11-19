import { Product } from '@/types/store';
import ProductCard from './ProductCard';
import { useCart } from '@/contexts/CartContext';

interface ProductGridProps {
  products: Product[];
  domain: string;
  publicToken: string;
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { domain, publicToken } = useCart();

  if (products.length === 0) {
    return (
      <p className="text-center text-gray-400 py-20">No products available</p>
    );
  }



  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
