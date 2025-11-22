// ==========================================
// API Client
// ==========================================

const API_BASE_URL = '/api';

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Item {
  id: number;
  title: string;
  description: string | null;
  price: number;
  owner_id: number;
  created_at: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  per_page: number;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  per_page: number;
}

// ==========================================
// User API
// ==========================================

export async function getUsers(page = 1, perPage = 10): Promise<UsersResponse> {
  const response = await fetch(`${API_BASE_URL}/users?page=${page}&per_page=${perPage}`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function getUser(id: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

export async function createUser(username: string, email: string, password: string): Promise<{ message: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create user');
  }
  return response.json();
}

// ==========================================
// Item API
// ==========================================

export async function getItems(page = 1, perPage = 10): Promise<ItemsResponse> {
  const response = await fetch(`${API_BASE_URL}/items?page=${page}&per_page=${perPage}`);
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
}

export async function getItem(id: number): Promise<Item> {
  const response = await fetch(`${API_BASE_URL}/items/${id}`);
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
): Promise<{ message: string; item: Item }> {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description, price, owner_id: ownerId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create item');
  }
  return response.json();
}
