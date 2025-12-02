'use client';

import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuth, getAuth, User } from '../lib/auth';
import { getCartItemCount } from '../lib/cart';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const updateAuth = () => {
    const auth = getAuth();
    if (auth) {
      setUser(auth.user);
    } else {
      setUser(null);
    }
  };

  const updateCartCount = () => {
    setCartCount(getCartItemCount());
  };

  useEffect(() => {
    setMounted(true);
    updateAuth();
    updateCartCount();

    // storage 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        updateAuth();
      }
      if (e.key === 'cart') {
        updateCartCount();
      }
    };

    // 커스텀 이벤트 리스너 (같은 탭에서 로그인/로그아웃 시)
    const handleAuthChange = () => {
      updateAuth();
    };

    const handleCartChange = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('cart-change', handleCartChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('cart-change', handleCartChange);
    };
  }, []);

  // pathname이 변경될 때마다 인증 상태 확인 (로그인/회원가입 후 페이지 이동 시)
  useEffect(() => {
    if (mounted) {
      updateAuth();
    }
  }, [pathname, mounted]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lian Shop
            </div>
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              홈
            </Link>
            <Link
              href="/products"
              className="text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              상품
            </Link>
            {user && user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium flex items-center space-x-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>관리자</span>
              </Link>
            )}
            <Link
              href="/about"
              className="text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              소개
            </Link>
          </nav>

          {/* 우측 아이콘들 */}
          <div className="flex items-center space-x-4">
            {/* 검색 아이콘 */}
            <button className="p-2 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* 장바구니 아이콘 */}
            <Link href="/cart" className="relative p-2 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg
                className="w-5 h-5"
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
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* 사용자 메뉴 */}
            {mounted && (
              <>
                {user ? (
                  <div className="relative group">
                    <button className="flex items-center space-x-2 p-2 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-zinc-200 dark:border-zinc-700 z-50">
                      <div className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                        {user.role === 'ADMIN' && (
                          <div className="mt-1">
                            <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                              관리자
                            </span>
                          </div>
                        )}
                      </div>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                          관리자 페이지
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      회원가입
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

