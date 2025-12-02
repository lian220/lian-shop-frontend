'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getAuth, getAuthHeaders } from '../../lib/auth';
import { getApiUrl } from '../../lib/api';

interface Order {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  orderNumber: string | null;
  items: OrderItem[];
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

const statusLabels: Record<string, string> = {
  PENDING: '결제 대기',
  PAYMENT_FAILED: '결제 실패',
  PAID: '결제 완료',
  PREPARING: '상품 준비 중',
  SHIPPED: '배송 중',
  DELIVERED: '배송 완료',
  CANCELLED: '주문 취소',
  REFUNDED: '환불 완료',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PAYMENT_FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PREPARING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  SHIPPED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  REFUNDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const auth = getAuth();
      if (!auth) {
        router.push('/login?redirect=/orders/' + orderId);
        return;
      }

      try {
        const response = await fetch(`${getApiUrl()}/orders/${orderId}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('주문을 찾을 수 없습니다.');
          } else {
            setError('백엔드 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();

        // 본인의 주문인지 확인
        if (data.userId !== auth.user.id) {
          setError('접근 권한이 없습니다.');
          setLoading(false);
          return;
        }

        setOrder(data);
      } catch (err) {
        console.error('주문 상세 로드 실패:', err);
        setError('백엔드 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300">
              {error || '주문을 찾을 수 없습니다.'}
            </p>
            <Link
              href="/orders"
              className="mt-4 inline-block text-red-600 dark:text-red-400 hover:underline"
            >
              주문 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/orders"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-4 inline-block"
          >
            ← 주문 목록으로
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              주문 상세
            </h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                statusColors[order.status] || statusColors.PENDING
              }`}
            >
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            주문번호: {order.orderNumber || `#${order.id}`}
          </p>
        </div>

        <div className="space-y-6">
          {/* 주문 상품 목록 */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              주문 상품
            </h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/product/${item.productId}`}
                      className="text-zinc-900 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-400 font-medium"
                    >
                      {item.productName}
                    </Link>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      수량: {item.quantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                      단가: {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 배송 정보 */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              배송 정보
            </h2>
            <div className="space-y-2">
              <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                {order.shippingAddress}
              </p>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              결제 정보
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">상품 금액</span>
                <span className="text-zinc-900 dark:text-zinc-50">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  총 결제 금액
                </span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

