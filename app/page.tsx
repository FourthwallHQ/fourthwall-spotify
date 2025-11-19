'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import MerchStore from '@/components/MerchStore';
import ConnectPage from '@/components/ConnectPage';

function HomeContent() {
  const searchParams = useSearchParams();
  const publicToken = searchParams.get('public_token');

  // If no token is provided, show the connect page
  if (!publicToken) {
    return <ConnectPage />;
  }

  // Otherwise, show the merch store
  return <MerchStore publicToken={publicToken} />;
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
