// ==========================================
// API Client with JWT Authentication
// ==========================================

const API_BASE_URL = '/api';
const TOKEN_KEY = 'fastapi_access_token';

// ==========================================
// Types
// ==========================================

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

export interface Item {
  id: number;
  title: string;
  description: string | null;
  price: number;
  owner_id: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// ==========================================
// Token Management
// ==========================================

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// ==========================================
// HTTP Helpers
// ==========================================

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 401 Unauthorized の場合、トークンを削除
  if (response.status === 401) {
    removeToken();
    throw new Error('Authentication failed. Please login again.');
  }

  return response;
}

// ==========================================
// Authentication API
// ==========================================

export async function login(username: string, password: string): Promise<LoginResponse> {
  // FastAPI の OAuth2PasswordRequestForm は application/x-www-form-urlencoded 形式
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Login failed');
  }

  const data: LoginResponse = await response.json();
  setToken(data.access_token);
  return data;
}

export function logout(): void {
  removeToken();
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/me`);
  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }
  return response.json();
}

// ==========================================
// User API
// ==========================================

export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create user' }));
    throw new Error(error.detail || 'Failed to create user');
  }

  return response.json();
}

// ==========================================
// Item API
// ==========================================

export async function getItems(skip = 0, limit = 10): Promise<Item[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/items?skip=${skip}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
}

export async function getItem(id: number): Promise<Item> {
  const response = await fetchWithAuth(`${API_BASE_URL}/items/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch item');
  }
  return response.json();
}

export async function createItem(
  title: string,
  description: string,
  price: number
): Promise<Item> {
  const response = await fetchWithAuth(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description, price }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create item' }));
    throw new Error(error.detail || 'Failed to create item');
  }

  return response.json();
}
