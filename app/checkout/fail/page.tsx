'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CheckoutFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // URL 파라미터에서 에러 정보 추출
    const code = searchParams.get('code');
    const message = searchParams.get('message');

    if (code) setErrorCode(code);
    if (message) setErrorMessage(decodeURIComponent(message));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-widest uppercase">
              결제 실패
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              결제 처리 중 오류가 발생했습니다.
            </p>
          </div>

          {(errorCode || errorMessage) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6 text-left">
              {errorCode && (
                <div className="mb-2">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                    에러 코드
                  </p>
                  <p className="font-semibold">{errorCode}</p>
                </div>
              )}
              {errorMessage && (
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                    에러 메시지
                  </p>
                  <p className="font-semibold">{errorMessage}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link
              href="/checkout"
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              다시 시도
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold tracking-widest uppercase rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400">로딩 중...</p>
        </div>
      </div>
    }>
      <CheckoutFailContent />
    </Suspense>
  );
}

