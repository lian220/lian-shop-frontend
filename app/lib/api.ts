// API 관련 유틸리티 함수

/**
 * API 기본 URL을 반환합니다.
 * NEXT_PUBLIC_API_URL이 이미 /api로 끝나면 그대로 사용하고, 아니면 /api를 추가합니다.
 */
export function getApiUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}

/**
 * 서버 사이드에서 사용할 API URL을 반환합니다.
 * localhost를 127.0.0.1로 변환하여 서버 사이드에서 더 안정적으로 작동하도록 합니다.
 */
export function getServerApiUrl(): string {
  const apiUrl = getApiUrl();
  return apiUrl.replace('localhost', '127.0.0.1');
}

/**
 * 공통 fetch 옵션을 반환합니다.
 */
export function getFetchOptions(options: RequestInit = {}): RequestInit {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };
}

/**
 * API 응답을 처리하고 에러를 던집니다.
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: `API 요청 실패: ${response.status} ${response.statusText}` 
    }));
    throw new Error(error.message || `API 요청 실패: ${response.status}`);
  }
  return response.json();
}

