import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  login,
  register,
  logout,
} from '../api';

describe('Token Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store token in localStorage', () => {
    const token = 'test_token_123';
    setToken(token);
    expect(localStorage.getItem('nodejs_access_token')).toBe(token);
  });

  it('should retrieve token from localStorage', () => {
    const token = 'test_token_456';
    localStorage.setItem('nodejs_access_token', token);
    expect(getToken()).toBe(token);
  });

  it('should remove token from localStorage', () => {
    const token = 'test_token_789';
    localStorage.setItem('nodejs_access_token', token);
    removeToken();
    expect(localStorage.getItem('nodejs_access_token')).toBeNull();
  });

  it('should return true if authenticated', () => {
    setToken('some_token');
    expect(isAuthenticated()).toBe(true);
  });

  it('should return false if not authenticated', () => {
    removeToken();
    expect(isAuthenticated()).toBe(false);
  });
});

describe('Authentication Functions', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('should login successfully and store token', async () => {
    const mockResponse = {
      access_token: 'mock_access_token',
      token_type: 'bearer',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true,
      },
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await login('testuser', 'password123');

    expect(result).toEqual(mockResponse);
    expect(getToken()).toBe('mock_access_token');
    expect(global.fetch).toHaveBeenCalledWith('/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'testuser', password: 'password123' }),
    });
  });

  it('should throw error on failed login', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Incorrect username or password' }),
    });

    await expect(login('wronguser', 'wrongpass')).rejects.toThrow('Incorrect username or password');
  });

  it('should register successfully and store token', async () => {
    const mockResponse = {
      access_token: 'new_user_token',
      token_type: 'bearer',
      user: {
        id: 2,
        username: 'newuser',
        email: 'newuser@example.com',
        is_active: true,
      },
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await register('newuser', 'newuser@example.com', 'password123');

    expect(result).toEqual(mockResponse);
    expect(getToken()).toBe('new_user_token');
    expect(global.fetch).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      }),
    });
  });

  it('should throw error on failed registration', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Username already exists' }),
    });

    await expect(
      register('existinguser', 'existing@example.com', 'password123')
    ).rejects.toThrow('Username already exists');
  });

  it('should logout and remove token', () => {
    setToken('some_token');
    logout();
    expect(getToken()).toBeNull();
  });
});
