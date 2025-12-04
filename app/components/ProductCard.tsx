import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(numPrice);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
    >
      <div className="relative aspect-square mb-4 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {formatPrice(product.price)}
        </p>
        {product.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {product.description}
          </p>
        )}
      </div>
    </Link>
  );
}

