import { Cart, AddToCartRequest } from '@/types/cart';

const STOREFRONT_API_URL = 'https://storefront-api.fourthwall.com/v1';

export async function createCart(
  storefrontToken: string,
  items: AddToCartRequest['items'],
  currency: string = 'USD'
): Promise<Cart> {
  const response = await fetch(
    `${STOREFRONT_API_URL}/carts?storefront_token=${storefrontToken}&currency=${currency}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create cart');
  }

  return response.json();
}

export async function addToCart(
  storefrontToken: string,
  cartId: string,
  items: AddToCartRequest['items'],
  currency: string = 'USD'
): Promise<Cart> {
  const response = await fetch(
    `${STOREFRONT_API_URL}/carts/${cartId}/add?storefront_token=${storefrontToken}&currency=${currency}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to add to cart');
  }

  return response.json();
}

export async function removeFromCart(
  storefrontToken: string,
  cartId: string,
  items: Array<{ variantId: string }>,
  currency: string = 'USD'
): Promise<Cart> {
  const response = await fetch(
    `${STOREFRONT_API_URL}/carts/${cartId}/remove?storefront_token=${storefrontToken}&currency=${currency}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to remove from cart');
  }

  return response.json();
}

export async function changeCartItemQuantity(
  storefrontToken: string,
  cartId: string,
  items: Array<{ variantId: string; quantity: number }>,
  currency: string = 'USD'
): Promise<Cart> {
  const response = await fetch(
    `${STOREFRONT_API_URL}/carts/${cartId}/change?storefront_token=${storefrontToken}&currency=${currency}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to change quantity');
  }

  return response.json();
}

export async function getCart(
  storefrontToken: string,
  cartId: string,
  currency: string = 'USD'
): Promise<Cart> {
  const response = await fetch(
    `${STOREFRONT_API_URL}/carts/${cartId}?storefront_token=${storefrontToken}&currency=${currency}`
  );

  if (!response.ok) {
    throw new Error('Failed to get cart');
  }

  return response.json();
}

