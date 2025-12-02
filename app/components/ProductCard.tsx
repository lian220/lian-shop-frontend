import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 mb-4 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700 text-xs uppercase tracking-widest">
            NO IMAGE
          </div>
        )}
        {product.stockQuantity === 0 && (
          <div className="absolute top-2 right-2 bg-black text-white text-[10px] px-2 py-1 font-bold uppercase">
            SOLD OUT
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold uppercase tracking-wide">
          {product.name}
        </h3>
        <span className="text-sm text-zinc-500">
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
}

