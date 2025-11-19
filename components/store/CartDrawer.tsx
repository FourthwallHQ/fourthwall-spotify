'use client';

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { formatPrice } from '@/lib/store-utils';
import { useState } from 'react';

interface CartDrawerProps {
  domain: string;
}

export default function CartDrawer({ domain }: CartDrawerProps) {
  const { cart, isCartOpen, closeCart, removeItem, updateQuantity, itemCount, subtotal } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  if (!isCartOpen) return null;

  const handleQuantityChange = async (variantId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(variantId));
    try {
      await updateQuantity(variantId, newQuantity);
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(variantId);
        return next;
      });
    }
  };

  const handleRemove = async (variantId: string) => {
    setUpdatingItems(prev => new Set(prev).add(variantId));
    try {
      await removeItem(variantId);
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(variantId);
        return next;
      });
    }
  };

  const handleCheckout = () => {
    if (cart && cart.items.length > 0) {
      // Redirect to Fourthwall checkout
      // Note: You'll need to get the proper checkout URL from Fourthwall
      window.open(`https://${domain}/checkout/${cart.id}`, '_blank');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#282828] z-50 shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#404040]">
          <h2 className="text-2xl font-bold">Your cart</h2>
          <button
            onClick={closeCart}
            className="text-white hover:text-gray-300 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Content */}
        {!cart || cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <p className="text-xl mb-6">Your cart is empty</p>
            <button
              onClick={closeCart}
              className="px-8 py-3 bg-[#1db954] text-black font-bold rounded-full hover:scale-105 transition"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <>
            {/* Artist Info */}
            {cart.items.length > 0 && (
              <div className="p-6 border-b border-[#404040]">
                <div className="flex items-center gap-3">
                  {cart.items[0].variant.product && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[#404040] overflow-hidden relative">
                        {cart.items[0].variant.images[0] && (
                          <Image
                            src={cart.items[0].variant.images[0].transformedUrl}
                            alt="Artist"
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <span className="font-medium">
                        {cart.items[0].variant.product.name.split(' ')[0]}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div key={item.variant.id} className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-[#404040] rounded-lg overflow-hidden relative flex-shrink-0">
                      {item.variant.images[0] && (
                        <Image
                          src={item.variant.images[0].transformedUrl}
                          alt={item.variant.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1 line-clamp-2">
                        {item.variant.product.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {item.variant.attributes.description}
                      </p>
                      <p className="font-medium">
                        {formatPrice(item.variant.unitPrice.value, item.variant.unitPrice.currency)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-[#404040] rounded">
                          <button
                            onClick={() => handleQuantityChange(item.variant.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingItems.has(item.variant.id)}
                            className="px-3 py-1 hover:bg-[#404040] transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-4 py-1 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.variant.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.variant.id)}
                            className="px-3 py-1 hover:bg-[#404040] transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.variant.id)}
                          disabled={updatingItems.has(item.variant.id)}
                          className="text-sm text-gray-400 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#404040] p-6 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">
                  {cart.items[0] && formatPrice(subtotal, cart.items[0].variant.unitPrice.currency)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-[#1db954] text-black font-bold rounded-full hover:scale-[1.02] transition"
              >
                Go to checkout
              </button>

              <p className="text-xs text-gray-400 text-center">
                By clicking "Go to checkout" you will leave the Spotify page. Any activity on their page will be subject to their terms and privacy policy. They may provide Spotify with your order details.
              </p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

