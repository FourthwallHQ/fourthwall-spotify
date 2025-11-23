'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import MerchStore from '@/components/MerchStore';
import ConnectPage from '@/components/ConnectPage';
import { CartProvider } from '@/contexts/CartContext';
import { ProductsProvider } from '@/contexts/ProductsContext';

function HomeContent() {
  const searchParams = useSearchParams();
  const publicToken = searchParams.get('public_token');
  const domain = searchParams.get('domain');
  const name = searchParams.get('name');

  // If no token is provided, show the connect page
  if (!publicToken || !domain || !name) {
    const handleConnect = () => {
      // Replace YOUR_APP_ID with your actual app ID
      const clientId = process.env.NEXT_PUBLIC_FOURTHWALL_APP_ID || 'YOUR_APP_ID';
      const redirectUri = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const authUrl = `https://my-shop.fourthwall.com/admin/platform-apps/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}/oauth`;
      
      window.location.href = authUrl;
    };

    return <ConnectPage handleConnect={handleConnect} />;
  }

  // Otherwise, show the merch store
  return <CartProvider publicToken={publicToken} domain={domain} name={name}>
    <ProductsProvider publicToken={publicToken}>
      <MerchStore domain={domain} />
    </ProductsProvider>
  </CartProvider>;
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
