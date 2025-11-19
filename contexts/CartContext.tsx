'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart } from '@/types/cart';
import { createCart, addToCart, removeFromCart, changeCartItemQuantity } from '@/lib/cart-api';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  publicToken,
  domain,
}: {
  children: ReactNode;
  publicToken: string;
  domain: string;
}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCartId = localStorage.getItem('fourthwall_cart_id');
    if (savedCartId) {
      // In a real app, you'd want to fetch the cart here to sync it
      // For now, we'll just initialize with the ID
    }
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = async (variantId: string, quantity: number) => {
    try {
      if (!cart) {
        // Create new cart
        const newCart = await createCart(publicToken, [{ variantId, quantity }]);
        setCart(newCart);
        localStorage.setItem('fourthwall_cart_id', newCart.id);
      } else {
        // Add to existing cart
        const updatedCart = await addToCart(publicToken, cart.id, [{ variantId, quantity }]);
        setCart(updatedCart);
      }
      openCart();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const removeItem = async (variantId: string) => {
    if (!cart) return;
    
    try {
      const updatedCart = await removeFromCart(publicToken, cart.id, [{ variantId }]);
      setCart(updatedCart);
      
      // Clear cart from localStorage if empty
      if (updatedCart.items.length === 0) {
        localStorage.removeItem('fourthwall_cart_id');
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
      const updatedCart = await changeCartItemQuantity(publicToken, cart.id, [
        { variantId, quantity },
      ]);
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

