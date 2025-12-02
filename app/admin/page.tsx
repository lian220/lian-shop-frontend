'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuth, getAuthHeaders } from '../lib/auth';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  stockQuantity: number;
  imageUrl: string | null;
}

interface Order {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  items: OrderItem[];
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      router.push('/login');
      return;
    }
    if (auth.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    setUser(auth.user);
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const auth = getAuth();
      
      if (!auth) {
        router.push('/login');
        return;
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      };
      
      // 상품 목록 로드 (관리자 API 사용)
      const productsRes = await fetch(`${apiUrl}/admin/products`, {
        headers,
      });
      
      if (productsRes.status === 403) {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
        return;
      }
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      }

      // 주문 목록은 아직 API가 없으므로 빈 배열로 설정
      // TODO: 주문 목록 API 추가 시 구현
      setOrders([]);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">
            관리자 대시보드
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            상품 및 주문을 관리할 수 있습니다.
          </p>
        </div>

        {/* 탭 메뉴 */}
        <div className="border-b border-zinc-200 dark:border-zinc-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              상품 관리
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              주문 관리
            </button>
          </nav>
        </div>

        {/* 상품 관리 탭 */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                상품 목록
              </h2>
              <Link
                href="/admin/products/new"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                + 새 상품 추가
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-zinc-600 dark:text-zinc-400">로딩 중...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-600 dark:text-zinc-400">등록된 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                  <thead className="bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        상품명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        가격
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        재고
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50">
                          {product.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {product.name}
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            {product.description || '설명 없음'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50">
                          ₩{typeof product.price === 'string' ? parseFloat(product.price).toLocaleString() : product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50">
                          {product.stockQuantity}개
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              수정
                            </Link>
                            <button
                              onClick={async () => {
                                if (!confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) {
                                  return;
                                }
                                
                                const auth = getAuth();
                                if (!auth) return;
                                
                                try {
                                  const apiUrl = getApiUrl();
                                  const response = await fetch(`${apiUrl}/admin/products/${product.id}`, {
                                    method: 'DELETE',
                                    headers: getAuthHeaders(),
                                  });
                                  
                                  if (response.ok) {
                                    // 상품 목록 새로고침
                                    loadData();
                                  } else {
                                    alert('상품 삭제에 실패했습니다.');
                                  }
                                } catch (error) {
                                  console.error('삭제 실패:', error);
                                  alert('상품 삭제에 실패했습니다.');
                                }
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 주문 관리 탭 */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">
              주문 목록
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-zinc-600 dark:text-zinc-400">로딩 중...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-600 dark:text-zinc-400">주문이 없습니다.</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                  주문 목록 API가 구현되면 여기에 표시됩니다.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {/* 주문 목록 테이블 */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

