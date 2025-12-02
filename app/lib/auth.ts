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

import { getApiUrl } from './api';

import { getFetchOptions, handleApiResponse } from './api';

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    ...getFetchOptions(),
    body: JSON.stringify(credentials),
  });

  return handleApiResponse<AuthResponse>(response);
}

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/auth/signup`, {
    method: 'POST',
    ...getFetchOptions(),
    body: JSON.stringify({
      ...data,
      role: data.role || 'CUSTOMER',
    }),
  });

  return handleApiResponse<AuthResponse>(response);
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

