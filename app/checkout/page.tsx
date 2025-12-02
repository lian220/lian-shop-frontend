'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { getCart, getCartTotal, clearCart, updateCartItemQuantity, CartItem } from '../lib/cart';
import { getAuth } from '../lib/auth';

// 토스페이먼츠 SDK 타입 정의
declare global {
  interface Window {
    TossPayments: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetsRef = useRef<any>(null);
  const tossPaymentsRef = useRef<any>(null);

  // 클라이언트 키 (환경 변수에서 가져오기)
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

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

    // 환경 변수 확인 (경고만 표시, 장바구니는 표시)
    if (!clientKey) {
      setError('토스페이먼츠 클라이언트 키가 설정되지 않았습니다. 환경 변수 NEXT_PUBLIC_TOSS_CLIENT_KEY를 확인해주세요.');
    } else {
      // 클라이언트 키 형식 확인 (결제위젯 연동 키는 test_ck_ 또는 live_ck_로 시작)
      if (!clientKey.startsWith('test_ck_') && !clientKey.startsWith('live_ck_')) {
        setError('잘못된 클라이언트 키 형식입니다. 결제위젯 연동 키를 사용해야 합니다. (개발자센터 > API 키 > 결제위젯 연동 키)');
      }
    }

    setCart(cartItems);
    const total = getCartTotal();
    setTotalAmount(total);
    setIsLoading(false);
  }, [router, clientKey]);

  // 토스페이먼츠 SDK 로드 후 초기화
  const initializeTossPayments = async () => {
    if (!clientKey) {
      setError('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.');
      return;
    }

    if (!window.TossPayments) {
      setError('토스페이먼츠 SDK를 불러올 수 없습니다.');
      return;
    }

    try {
      const auth = getAuth();
      if (!auth) {
        router.push('/login?redirect=/checkout');
        return;
      }

      // 고유한 customerKey 생성 (사용자 ID 기반)
      const customerKey = `customer_${auth.user.id}_${Date.now()}`;

      // 토스페이먼츠 초기화
      tossPaymentsRef.current = window.TossPayments(clientKey);

      // 결제위젯 인스턴스 생성 (비회원 결제)
      widgetsRef.current = tossPaymentsRef.current.widgets({
        customerKey: window.TossPayments.ANONYMOUS,
      });

      // 결제 금액 설정
      await widgetsRef.current.setAmount({
        currency: 'KRW',
        value: totalAmount,
      });

      // 결제 UI 렌더링
      await widgetsRef.current.renderPaymentMethods({
        selector: '#payment-method',
        variantKey: 'DEFAULT',
      });

      // 약관 UI 렌더링
      await widgetsRef.current.renderAgreement({
        selector: '#agreement',
        variantKey: 'AGREEMENT',
      });

      setIsPaymentReady(true);
    } catch (err: any) {
      let errorMessage = err.message || '알 수 없는 오류가 발생했습니다.';
      
      // 결제위젯 연동 키 관련 에러인 경우 더 명확한 메시지 제공
      if (errorMessage.includes('결제위젯 연동 키') || errorMessage.includes('API 개별 연동 키')) {
        errorMessage = '결제위젯 연동 키를 사용해야 합니다. 토스페이먼츠 개발자센터(https://developers.tosspayments.com) > API 키 메뉴에서 "결제위젯 연동 키"를 확인하고 환경 변수에 설정해주세요. (현재 "API 개별 연동 키"를 사용 중일 수 있습니다)';
      }
      
      setError(`결제 시스템 초기화에 실패했습니다: ${errorMessage}`);
    }
  };

  // 결제 요청
  const handlePayment = async () => {
    if (!widgetsRef.current) {
      setError('결제 시스템이 준비되지 않았습니다.');
      return;
    }

    try {
      const auth = getAuth();
      if (!auth) {
        router.push('/login?redirect=/checkout');
        return;
      }

      // 고유한 주문번호 생성
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 주문 상품명 생성
      const orderName = cart.length === 1
        ? cart[0].name
        : `${cart[0].name} 외 ${cart.length - 1}건`;

      // 결제 요청
      await widgetsRef.current.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
        customerEmail: auth.user.email,
        customerName: auth.user.name,
      });
    } catch (err: any) {
      setError(`결제 요청에 실패했습니다: ${err.message}`);
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
    
    // 토스페이먼츠 금액 업데이트
    if (widgetsRef.current && total > 0) {
      widgetsRef.current.setAmount({
        currency: 'KRW',
        value: total,
      }).catch(() => {
        // 금액 업데이트 실패 시 무시
      });
    }
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
      {/* 토스페이먼츠 SDK 스크립트 */}
      <Script
        src="https://js.tosspayments.com/v2/standard"
        onLoad={initializeTossPayments}
        strategy="lazyOnload"
      />

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

              {/* 결제 UI */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-xl font-bold mb-4 tracking-widest uppercase">
                  결제 수단
                </h2>
                <div id="payment-method"></div>
              </div>

              {/* 약관 UI */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                <div id="agreement"></div>
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
                  disabled={!isPaymentReady || !clientKey || cart.length === 0}
                  className="w-full py-3 px-6 bg-black dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {!clientKey 
                    ? '클라이언트 키 필요' 
                    : !isPaymentReady 
                    ? '결제 준비 중...' 
                    : '결제하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

