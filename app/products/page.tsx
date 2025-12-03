import { redirect } from 'next/navigation';

// /products 경로를 홈으로 리다이렉트
export default function ProductsPage() {
  redirect('/');
}

