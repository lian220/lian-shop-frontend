// 공통 유틸리티 함수

/**
 * 가격을 파싱하여 number로 반환합니다.
 * BigDecimal은 JSON에서 문자열로 변환될 수 있으므로 이를 처리합니다.
 */
export function parsePrice(price: number | string): number {
  if (typeof price === 'string') {
    return parseFloat(price);
  }
  return price;
}

/**
 * 가격을 포맷팅하여 반환합니다.
 */
export function formatPrice(price: number | string): string {
  return `₩${parsePrice(price).toLocaleString()}`;
}

/**
 * 재고 상태를 반환합니다.
 */
export function getStockStatus(stockQuantity: number): {
  label: string;
  className: string;
} {
  if (stockQuantity === 0) {
    return {
      label: 'SOLD OUT',
      className: 'text-red-600 dark:text-red-400',
    };
  }
  if (stockQuantity < 10) {
    return {
      label: 'LOW STOCK',
      className: 'text-orange-600 dark:text-orange-400',
    };
  }
  return {
    label: 'IN STOCK',
    className: 'text-green-600 dark:text-green-400',
  };
}

