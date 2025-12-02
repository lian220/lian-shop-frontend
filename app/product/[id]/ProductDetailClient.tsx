'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '../../types';
import { addToCart } from '../../lib/cart';
import { getAuth } from '../../lib/auth';
import { parsePrice, formatPrice } from '../../lib/utils';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= product.stockQuantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product.stockQuantity === 0) return;

    setIsAdding(true);
    setMessage(null);

    try {
      addToCart({
        productId: product.id,
        name: product.name,
        price: parsePrice(product.price),
        quantity: quantity,
        imageUrl: product.imageUrl,
      });

      setMessage('장바구니에 추가되었습니다!');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage('장바구니 추가에 실패했습니다.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (product.stockQuantity === 0) return;

    const auth = getAuth();
    if (!auth) {
      router.push('/login?redirect=/product/' + product.id);
      return;
    }

    // 장바구니에 추가하고 주문 페이지로 이동
    addToCart({
      productId: product.id,
      name: product.name,
      price: parsePrice(product.price),
      quantity: quantity,
      imageUrl: product.imageUrl,
    });

    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 max-w-7xl mx-auto">
          {/* 상품 이미지 */}
          <div className="w-full">
            <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-zinc-300 dark:text-zinc-700 text-sm uppercase tracking-widest">
                    NO IMAGE
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-col">
            {/* 상품명 */}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 uppercase">
              {product.name}
            </h1>

            {/* 가격 */}
            <div className="mb-8">
              <span className="text-2xl md:text-3xl font-bold">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* 재고 상태 */}
            {product.stockQuantity === 0 && (
              <div className="mb-6">
                <span className="text-xs uppercase tracking-widest text-red-600 dark:text-red-400">
                  SOLD OUT
                </span>
              </div>
            )}

            {/* 상품 설명 */}
            {product.description && (
              <div className="mb-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                <div className="whitespace-pre-line">{product.description}</div>
              </div>
            )}

            {/* 수량 선택 */}
            <div className="mb-8">
              <label className="block text-xs uppercase tracking-widest mb-3 text-zinc-500 dark:text-zinc-400">
                QUANTITY
              </label>
              <div className="flex items-center border-b border-black dark:border-white w-fit">
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="px-4 py-2 text-black dark:text-white hover:opacity-50 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stockQuantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 text-center py-2 bg-transparent text-black dark:text-white border-x border-black dark:border-white text-lg"
                />
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= product.stockQuantity}
                  className="px-4 py-2 text-black dark:text-white hover:opacity-50 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* 메시지 */}
            {message && (
              <div className={`mb-6 text-sm ${
                message.includes('추가되었습니다') 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {message}
              </div>
            )}

            {/* 버튼 */}
            <div className="space-y-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0 || isAdding}
                className="w-full border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black py-4 text-sm uppercase tracking-widest font-medium hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isAdding ? 'ADDING...' : product.stockQuantity > 0 ? "ADD TO CART" : "SOLD OUT"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stockQuantity === 0}
                className="w-full border border-black dark:border-white bg-transparent text-black dark:text-white py-4 text-sm uppercase tracking-widest font-medium hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                BUY NOW
              </button>
            </div>

            {/* 추가 정보 */}
            <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <div className="space-y-4 text-xs text-zinc-500 dark:text-zinc-400">
                <div>
                  <span className="uppercase tracking-widest">SHIPPING</span>
                  <p className="mt-2">무료 배송 (5만원 이상)</p>
                </div>
                <div>
                  <span className="uppercase tracking-widest">RETURNS</span>
                  <p className="mt-2">7일 이내 가능</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

