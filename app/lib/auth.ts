// 인증 관련 유틸리티 함수

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '로그인에 실패했습니다.' }));
    throw new Error(error.message || '로그인에 실패했습니다.');
  }

  return response.json();
}

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      role: data.role || 'CUSTOMER',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '회원가입에 실패했습니다.' }));
    throw new Error(error.message || '회원가입에 실패했습니다.');
  }

  return response.json();
}

export function saveAuth(authResponse: AuthResponse) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    // 커스텀 이벤트 발생 (Header 컴포넌트가 상태 업데이트하도록)
    window.dispatchEvent(new Event('auth-change'));
  }
}

export function getAuth(): { token: string; user: User } | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) return null;
  
  try {
    return {
      token,
      user: JSON.parse(userStr),
    };
  } catch {
    return null;
  }
}

/**
 * 인증 헤더를 포함한 fetch 옵션 반환
 */
export function getAuthHeaders(): HeadersInit {
  const auth = getAuth();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (auth?.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }
  
  return headers;
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 커스텀 이벤트 발생 (Header 컴포넌트가 상태 업데이트하도록)
    window.dispatchEvent(new Event('auth-change'));
  }
}

