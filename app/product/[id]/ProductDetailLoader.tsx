'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductDetailClient from './ProductDetailClient';
import { Product } from '../../types';
import { getApiUrl, getFetchOptions } from '../../lib/api';

interface ProductDetailLoaderProps {
  productId?: string;
  initialProduct: Product | null;
}

export default function ProductDetailLoader({ productId: propProductId, initialProduct }: ProductDetailLoaderProps) {
  const params = useParams();
  // URL에서 직접 id를 가져오거나 prop에서 가져오기
  const productId = (params?.id as string) || propProductId || '';
  
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // productId가 없으면 에러
    if (!productId) {
      setError('상품 ID가 없습니다.');
      setLoading(false);
      return;
    }

    // 서버에서 데이터를 가져오지 못한 경우 클라이언트에서 재시도
    if (!initialProduct) {
      const fetchProduct = async () => {
        try {
          const apiUrl = getApiUrl();
          const res = await fetch(`${apiUrl}/products/${productId}`, {
            ...getFetchOptions(),
          });

          if (!res.ok) {
            setError(`상품을 불러올 수 없습니다 (${res.status})`);
            setLoading(false);
            return;
          }

          const data = await res.json();
          setProduct(data);
          setLoading(false);
        } catch (err) {
          console.error('상품 로드 실패:', err);
          setError('백엔드 서버에 연결할 수 없습니다.');
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [productId, initialProduct]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h1 className="text-lg font-bold mb-2 text-yellow-900 dark:text-yellow-100">
                  상품을 불러올 수 없습니다
                </h1>
                {error && (
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    {error}
                  </p>
                )}
                <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-4 space-y-1">
                  <p>• 상품 ID: <span className="font-mono">{productId}</span></p>
                  <p>• 백엔드 서버가 실행 중인지 확인해주세요</p>
                  <p className="text-xs mt-2 text-yellow-600 dark:text-yellow-400">
                    백엔드를 실행하려면: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">cd backend && ./gradlew bootRun</code>
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-block text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 hover:underline font-medium"
                >
                  ← 홈으로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}

