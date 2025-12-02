'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuth, getAuthHeaders } from '../lib/auth';
import { getApiUrl } from '../lib/api';

interface Order {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  orderNumber: string | null;
  createdAt: string | null;
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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const auth = getAuth();
      if (!auth) {
        router.push('/login?redirect=/orders');
        return;
      }

      try {
        const response = await fetch(
          `${getApiUrl()}/orders/user/${auth.user.id}`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error('주문 목록을 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            주문 내역
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            주문하신 상품의 내역을 확인하실 수 있습니다.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              주문 내역이 없습니다.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          주문번호: {order.orderNumber || `#${order.id}`}
                        </h2>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            statusColors[order.status] || statusColors.PENDING
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      {order.createdAt && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          주문일: {new Date(order.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-zinc-600 dark:text-zinc-400">
                            {item.productName} × {item.quantity}
                          </span>
                          <span className="text-zinc-900 dark:text-zinc-50">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">
                          외 {order.items.length - 2}개 상품
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

