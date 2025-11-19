'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import MerchStore from '@/components/MerchStore';
import ConnectPage from '@/components/ConnectPage';
import { CartProvider } from '@/contexts/CartContext';

function HomeContent() {
  const searchParams = useSearchParams();
  const publicToken = searchParams.get('public_token');
  const domain = searchParams.get('domain');
  const name = searchParams.get('name');

  // If no token is provided, show the connect page
  if (!publicToken || !domain || !name) {
    return <ConnectPage />;
  }

  // Otherwise, show the merch store
  return <CartProvider publicToken={publicToken} domain={domain} name={name}  ><MerchStore publicToken={publicToken} domain={domain} /></CartProvider>;
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
