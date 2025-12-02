// 장바구니 관련 유틸리티 함수

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

const CART_STORAGE_KEY = 'cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const cartStr = localStorage.getItem(CART_STORAGE_KEY);
    return cartStr ? JSON.parse(cartStr) : [];
  } catch {
    return [];
  }
}

export function addToCart(item: CartItem) {
  if (typeof window === 'undefined') return;
  
  const cart = getCart();
  const existingItem = cart.find(c => c.productId === item.productId);
  
  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-change'));
}

export function removeFromCart(productId: number) {
  if (typeof window === 'undefined') return;
  
  const cart = getCart().filter(item => item.productId !== productId);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-change'));
}

export function updateCartItemQuantity(productId: number, quantity: number) {
  if (typeof window === 'undefined') return;
  
  const cart = getCart();
  const item = cart.find(c => c.productId === productId);
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-change'));
    }
  }
}

export function clearCart() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event('cart-change'));
}

export function getCartItemCount(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

