'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCart, getCartTotal, updateCartItemQuantity, removeFromCart, CartItem } from '../lib/cart';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCart = () => {
      const cartItems = getCart();
      setCart(cartItems);
      const total = getCartTotal();
      setTotalAmount(total);
      setIsLoading(false);
    };

    loadCart();

    // 장바구니 변경 이벤트 리스너
    const handleCartChange = () => {
      loadCart();
    };

    window.addEventListener('cart-change', handleCartChange);
    window.addEventListener('storage', handleCartChange);

    return () => {
      window.removeEventListener('cart-change', handleCartChange);
      window.removeEventListener('storage', handleCartChange);
    };
  }, []);

  // 수량 업데이트 핸들러
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // 수량이 0 이하면 장바구니에서 제거
      removeFromCart(productId);
      const updatedCart = cart.filter(item => item.productId !== productId);
      setCart(updatedCart);
    } else {
      // 수량 업데이트
      updateCartItemQuantity(productId, newQuantity);
      const updatedCart = cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      setCart(updatedCart);
    }
    
    // 총액 재계산
    const updatedCart = getCart();
    const total = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(total);
  };

  // 수량 증가
  const handleIncrease = (productId: number) => {
    const item = cart.find(c => c.productId === productId);
    if (item) {
      handleQuantityChange(productId, item.quantity + 1);
    }
  };

  // 수량 감소
  const handleDecrease = (productId: number) => {
    const item = cart.find(c => c.productId === productId);
    if (item) {
      handleQuantityChange(productId, item.quantity - 1);
    }
  };

  // 상품 삭제
  const handleRemove = (productId: number) => {
    if (confirm('이 상품을 장바구니에서 제거하시겠습니까?')) {
      removeFromCart(productId);
      const updatedCart = cart.filter(item => item.productId !== productId);
      setCart(updatedCart);
      
      // 총액 재계산
      const updatedCart2 = getCart();
      const total = updatedCart2.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotalAmount(total);
    }
  };

  // 금액 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-x-hidden">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 tracking-widest uppercase">
          장바구니
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-zinc-400 dark:text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-4">
              장바구니가 비어있습니다
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-medium tracking-widest uppercase rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* 장바구니 상품 목록 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold mb-4 tracking-widest uppercase">
                  상품 목록
                </h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 last:border-0"
                    >
                      <Link href={`/product/${item.productId}`} className="flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-20 h-20 md:w-24 md:h-24 object-cover rounded hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center">
                            <span className="text-xs text-zinc-400 uppercase">No Image</span>
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0 w-full">
                        <Link
                          href={`/product/${item.productId}`}
                          className="block font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                          {formatPrice(item.price)}원
                        </p>
                        {/* 수량 조절 */}
                        <div className="flex items-center justify-between sm:justify-start gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDecrease(item.productId)}
                              className="w-8 h-8 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              aria-label="수량 감소"
                            >
                              −
                            </button>
                            <span className="w-12 text-center text-sm font-medium">
                              {item.quantity}개
                            </span>
                            <button
                              onClick={() => handleIncrease(item.productId)}
                              className="w-8 h-8 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              aria-label="수량 증가"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-base md:text-lg whitespace-nowrap">
                              {formatPrice(item.price * item.quantity)}원
                            </p>
                            <button
                              onClick={() => handleRemove(item.productId)}
                              className="text-sm text-red-600 dark:text-red-400 hover:underline whitespace-nowrap"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 md:p-6 lg:sticky lg:top-4">
                <h2 className="text-lg md:text-xl font-bold mb-4 tracking-widest uppercase">
                  주문 요약
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      상품 금액
                    </span>
                    <span>{formatPrice(totalAmount)}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      배송비
                    </span>
                    <span>무료</span>
                  </div>
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>총 결제 금액</span>
                      <span>{formatPrice(totalAmount)}원</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-3 px-6 bg-black dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  주문하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

