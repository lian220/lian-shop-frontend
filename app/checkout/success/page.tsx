'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { clearCart } from '../../lib/cart';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentKey, setPaymentKey] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      // URL 파라미터에서 결제 정보 추출
      const orderIdParam = searchParams.get('orderId');
      const paymentKeyParam = searchParams.get('paymentKey');
      const amountParam = searchParams.get('amount');

      if (!orderIdParam || !paymentKeyParam || !amountParam) {
        setError('결제 정보가 올바르지 않습니다.');
        setConfirming(false);
        return;
      }

      setOrderId(orderIdParam);
      setPaymentKey(paymentKeyParam);
      setAmount(Number(amountParam));

      try {
        // 서버에 결제 승인 요청
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
        const response = await fetch(`${apiUrl}/payments/confirm/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey: paymentKeyParam,
            orderId: orderIdParam,
            amount: Number(amountParam),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '결제 승인에 실패했습니다.');
        }

        // 결제 승인 성공 - 장바구니 비우기
        clearCart();
      } catch (err: any) {
        console.error('결제 승인 실패:', err);
        setError(err.message || '결제 승인 중 오류가 발생했습니다.');
      } finally {
        setConfirming(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (confirming) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">결제 승인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-red-200 dark:border-red-800 p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2 tracking-widest uppercase">
                결제 승인 실패
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">{error}</p>
            </div>
            <Link
              href="/"
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors inline-block"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-widest uppercase">
              결제 완료
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              주문이 성공적으로 완료되었습니다.
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-6 mb-6 text-left">
            {orderId && (
              <div className="mb-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  주문번호
                </p>
                <p className="font-semibold">{orderId}</p>
              </div>
            )}
            {amount && (
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  결제 금액
                </p>
                <p className="font-semibold text-lg">
                  {formatPrice(amount)}원
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              홈으로
            </Link>
            <Link
              href="/orders"
              className="px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold tracking-widest uppercase rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              주문 내역
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400">로딩 중...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

