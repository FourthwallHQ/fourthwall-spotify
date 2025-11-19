'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart } from '@/types/cart';
import { createCart, addToCart, removeFromCart, changeCartItemQuantity, getCart } from '@/lib/cart-api';

interface CartContextType {
  cart: Cart | null;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  publicToken: string;
  domain: string;
  name: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getCartStorageKey = (publicToken: string) => `fourthwall_cart_id_${publicToken}`;

export function CartProvider({
  children,
  publicToken,
  domain,
  name,
}: {
  children: ReactNode;
  publicToken: string;
  domain: string;
  name: string;
}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from API on mount using stored cart ID
  useEffect(() => {
    const loadCart = async () => {
      const savedCartId = localStorage.getItem(getCartStorageKey(publicToken));
      if (savedCartId) {
        try {
          // Fetch the cart from the API to get current state
          const fetchedCart = await getCart(publicToken, savedCartId);
          setCart(fetchedCart);
        } catch (error) {
          console.error('Failed to load cart:', error);
          // Clear invalid cart ID
          localStorage.removeItem(getCartStorageKey(publicToken));
        }
      }
      setIsLoading(false);
    };

    loadCart();
  }, [publicToken]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = async (variantId: string, quantity: number) => {
    try {
      let updatedCart: Cart;
      
      if (!cart) {
        // Create new cart via API
        updatedCart = await createCart(publicToken, [{ variantId, quantity }]);
        // Store cart ID in localStorage for persistence
        localStorage.setItem(getCartStorageKey(publicToken), updatedCart.id);
      } else {
        // Add to existing cart via API
        updatedCart = await addToCart(publicToken, cart.id, [{ variantId, quantity }]);
      }
      
      // Update local state with API response
      setCart(updatedCart);
      openCart();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const removeItem = async (variantId: string) => {
    if (!cart) return;
    
    try {
      // Remove item via API
      const updatedCart = await removeFromCart(publicToken, cart.id, [{ variantId }]);
      
      // Update local state with API response
      setCart(updatedCart);
      
      // Clear cart from localStorage if empty
      if (updatedCart.items.length === 0) {
        localStorage.removeItem(getCartStorageKey(publicToken));
        setCart(null);
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (variantId: string, quantity: number) => {
    if (!cart) return;
    
    try {
      // Update quantity via API
      const updatedCart = await changeCartItemQuantity(publicToken, cart.id, [
        { variantId, quantity },
      ]);
      
      // Update local state with API response
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const itemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  
  const subtotal = cart?.items.reduce((total, item) => {
    return total + item.variant.unitPrice.value * item.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        itemCount,
        subtotal,
        isLoading,
        publicToken,
        domain,
        name,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

