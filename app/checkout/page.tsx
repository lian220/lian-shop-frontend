'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, getCartTotal, clearCart, updateCartItemQuantity, CartItem } from '../lib/cart';
import { getAuth } from '../lib/auth';
import { getClientApiUrl } from '../lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 인증 확인
    const auth = getAuth();
    if (!auth) {
      router.push('/login?redirect=/checkout');
      return;
    }

    // 장바구니 확인
    const cartItems = getCart();
    
    if (cartItems.length === 0) {
      setError('장바구니가 비어있습니다. 상품을 추가해주세요.');
      setIsLoading(false);
      return;
    }

    setCart(cartItems);
    const total = getCartTotal();
    setTotalAmount(total);
    setIsLoading(false);
  }, [router]);

  // 결제 시스템 준비
  useEffect(() => {
    if (cart.length > 0) {
      setIsPaymentReady(true);
    }
  }, [cart]);

  // 결제 요청
  const handlePayment = async () => {
    if (!isPaymentReady) {
      setError('결제 시스템이 준비되지 않았습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      if (!auth) {
        router.push('/login?redirect=/checkout');
        return;
      }

      // 주문 상품명 생성
      const orderName = cart.length === 1
        ? cart[0].name
        : `${cart[0].name} 외 ${cart.length - 1}건`;

      // 1. 서버에 주문 생성 요청
      const apiUrl = getClientApiUrl();
      const orderResponse = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          userId: auth.user.id,
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          shippingAddress: '서울시 강남구', // TODO: 배송지 입력 폼 추가
          customerName: auth.user.name || '고객',
          customerEmail: auth.user.email || '',
          customerPhone: '010-0000-0000' // TODO: 전화번호 입력 폼 추가
        })
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('주문 생성 실패:', {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          error: errorText
        });
        throw new Error(`주문 생성에 실패했습니다 (${orderResponse.status}): ${errorText}`);
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.orderNumber;

      // 2. 서버에 결제 준비 요청 (네이버페이)
      const baseUrl = window.location.origin;
      const prepareResponse = await fetch(`${apiUrl}/payments/prepare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: Math.round(totalAmount * 100) / 100, // 소수점 2자리까지 반올림
          orderName: orderName,
          successUrl: `${baseUrl}/checkout/success`,
          failUrl: `${baseUrl}/checkout/fail`
        })
      });

      if (!prepareResponse.ok) {
        throw new Error('결제 준비에 실패했습니다');
      }

      const prepareData = await prepareResponse.json();

      // 3. 네이버페이 결제 URL로 리다이렉트
      window.location.href = prepareData.paymentUrl;

    } catch (err: any) {
      setError(`결제 요청에 실패했습니다: ${err.message}`);
      setIsLoading(false);
    }
  };

  // 수량 업데이트 핸들러
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // 수량이 0 이하면 장바구니에서 제거
      const updatedCart = cart.filter(item => item.productId !== productId);
      setCart(updatedCart);
      updateCartItemQuantity(productId, 0);
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
    <>
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <h1 className="text-3xl font-bold mb-8 tracking-widest uppercase">
            주문서
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 주문 정보 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 주문 상품 목록 */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-xl font-bold mb-4 tracking-widest uppercase">
                  주문 상품
                </h2>
                <div className="space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
                      <p>장바구니가 비어있습니다.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 last:border-0"
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{item.name}</h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                            {formatPrice(item.price)}원
                          </p>
                          {/* 수량 조절 */}
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
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {formatPrice(item.price * item.quantity)}원
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 결제 수단 안내 */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-xl font-bold mb-4 tracking-widest uppercase">
                  결제 수단
                </h2>
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">네이버페이</p>
                    <p className="text-sm text-green-600 dark:text-green-400">간편하고 안전한 결제</p>
                  </div>
                </div>
                <div id="naver-pay-button" className="mt-4"></div>
              </div>
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4 tracking-widest uppercase">
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

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={isLoading || !isPaymentReady || cart.length === 0}
                  className="w-full py-3 px-6 bg-[#03C75A] hover:bg-[#02B350] text-white font-bold tracking-widest uppercase rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading 
                    ? '처리 중...' 
                    : !isPaymentReady 
                    ? '결제 준비 중...' 
                    : '네이버페이로 결제하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
