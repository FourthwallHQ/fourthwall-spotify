'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, use } from 'react';
import ProductDetail from '@/components/store/ProductDetail';
import LoadingState from '@/components/store/LoadingState';
import { CartProvider } from '@/contexts/CartContext';

function ProductPageContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const publicToken = searchParams.get('public_token');
  const domain = searchParams.get('domain');
  const name = searchParams.get('name');

  if (!publicToken || !domain || !name) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <p className="text-lg">Missing required parameters</p>
      </div>
    );
  }

  return <CartProvider publicToken={publicToken} domain={domain} name={name} >
    <ProductDetail slug={slug} />
  </CartProvider>;
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <Suspense fallback={<LoadingState />}>
      <ProductPageContent slug={resolvedParams.slug} />
    </Suspense>
  );
}
