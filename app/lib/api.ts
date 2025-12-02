/**
 * API 유틸리티 함수
 */

/**
 * 서버 사이드에서 사용할 API URL을 반환
 */
export function getServerApiUrl(): string {
  // 서버 사이드에서는 내부 네트워크 URL 사용
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
}

/**
 * 클라이언트 사이드에서 사용할 API URL을 반환
 */
export function getClientApiUrl(): string {
  // 클라이언트 사이드에서는 공개 URL 사용
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
}

/**
 * fetch 옵션을 반환 (헤더 등)
 */
export function getFetchOptions(token?: string): RequestInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return {
    headers,
  };
}

/**
 * API 요청을 수행하는 헬퍼 함수
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const apiUrl = getClientApiUrl();
  const url = `${apiUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

