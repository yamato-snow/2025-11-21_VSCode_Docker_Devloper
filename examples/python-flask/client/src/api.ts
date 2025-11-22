// ==========================================
// API Client with JWT Authentication
// ==========================================

const API_BASE_URL = '/api';
const AUTH_BASE_URL = '/auth';
const TOKEN_KEY = 'flask_access_token';

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

export interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  per_page: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  per_page: number;
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
  // Flask は JSON 形式でusername/passwordを受け取る
  const response = await fetch(`${AUTH_BASE_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(error.error || 'Login failed');
  }

  const data: LoginResponse = await response.json();
  setToken(data.access_token);
  return data;
}

export function logout(): void {
  removeToken();
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetchWithAuth(`${AUTH_BASE_URL}/me`);
  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }
  return response.json();
}

// ==========================================
// User API
// ==========================================

export async function getUsers(page = 1, perPage = 10): Promise<UsersResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/users?page=${page}&per_page=${perPage}`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function getUser(id: number): Promise<User> {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<LoginResponse> {
  // Flask の /auth/register はトークンを返す
  const response = await fetch(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create user' }));
    throw new Error(error.error || 'Failed to create user');
  }

  const data: LoginResponse = await response.json();
  setToken(data.access_token);
  return data;
}

// ==========================================
// Item API
// ==========================================

export async function getItems(page = 1, perPage = 10): Promise<ItemsResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/items?page=${page}&per_page=${perPage}`);
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
  price: number,
  ownerId: number
): Promise<Item> {
  const response = await fetchWithAuth(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description, price, owner_id: ownerId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create item' }));
    throw new Error(error.error || 'Failed to create item');
  }

  return response.json();
}
