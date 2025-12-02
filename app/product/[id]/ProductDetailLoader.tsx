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
          console.error('Error fetching product:', err);
          setError('상품을 불러오는 중 오류가 발생했습니다.');
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
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-black dark:text-zinc-50">
            상품을 찾을 수 없습니다
          </h1>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          )}
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            상품 ID: {productId}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-6">
            백엔드 서버가 실행 중인지 확인해주세요.
          </p>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}

