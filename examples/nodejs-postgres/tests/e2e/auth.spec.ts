import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form on initial load', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Node.js \+ React/ })).toBeVisible();
    await expect(page.getByText('JWT Authentication Example')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  test('should login with default credentials', async ({ page }) => {
    await page.getByLabel('ユーザー名').fill('testuser');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: /ログイン/ }).click();

    // Wait for navigation after successful login
    await expect(page.getByText(/ユーザー管理/)).toBeVisible({ timeout: 10000 });
  });

  test('should show error with incorrect credentials', async ({ page }) => {
    await page.getByLabel('ユーザー名').fill('wronguser');
    await page.getByLabel('パスワード').fill('wrongpassword');
    await page.getByRole('button', { name: /ログイン/ }).click();

    // Error message should appear
    await expect(page.getByText(/Incorrect username or password/)).toBeVisible();
  });

  test('should register new user', async ({ page }) => {
    const timestamp = Date.now();
    const newUsername = `e2euser_${timestamp}`;
    const newEmail = `e2e_${timestamp}@example.com`;

    // Switch to signup form
    await page.getByRole('button', { name: '新規登録' }).click();

    await page.getByLabel('ユーザー名').fill(newUsername);
    await page.getByLabel('メールアドレス').fill(newEmail);
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: /登録してログイン/ }).click();

    // Should auto-login after registration
    await expect(page.getByText(/ユーザー管理/)).toBeVisible({ timeout: 10000 });
  });

  test('should switch between login and signup tabs', async ({ page }) => {
    // Initially on login tab
    await expect(page.getByRole('button', { name: 'ログイン' })).toHaveClass(/bg-white text-blue-600/);

    // Switch to signup
    await page.getByRole('button', { name: '新規登録' }).click();
    await expect(page.getByRole('button', { name: '新規登録' })).toHaveClass(/bg-white text-blue-600/);
    await expect(page.getByLabel('メールアドレス')).toBeVisible();

    // Switch back to login
    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page.getByRole('button', { name: 'ログイン' })).toHaveClass(/bg-white text-blue-600/);
  });
});

test.describe('Authenticated User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login first
    await page.getByLabel('ユーザー名').fill('testuser');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: /ログイン/ }).click();
    await expect(page.getByText(/ユーザー管理/)).toBeVisible({ timeout: 10000 });
  });

  test('should view users list', async ({ page }) => {
    await expect(page.getByText(/ユーザー管理/)).toBeVisible();
    // Table should be visible
    await expect(page.locator('table')).toBeVisible();
    // Should have at least one user (testuser)
    await expect(page.getByText('testuser')).toBeVisible();
  });

  test('should navigate to items tab', async ({ page }) => {
    await page.getByText(/アイテム管理/).click();
    await expect(page.getByText(/アイテム作成/)).toBeVisible();
  });

  test('should create new item', async ({ page }) => {
    await page.getByText(/アイテム管理/).click();

    // Fill in item creation form
    await page.getByPlaceholder(/例: MacBook Pro/).fill('E2E Test Item');
    await page.getByPlaceholder(/円/).fill('5000');

    // Submit form
    await page.getByRole('button', { name: /作成/ }).click();

    // Wait for success message or item to appear in list
    await expect(page.getByText('E2E Test Item')).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Find and click logout button
    await page.getByRole('button', { name: /ログアウト/ }).click();

    // Should redirect to login page
    await expect(page.getByRole('heading', { name: /Node.js \+ React/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });
});
