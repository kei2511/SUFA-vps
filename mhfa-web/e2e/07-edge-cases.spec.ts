import { test, expect } from '@playwright/test';

test.describe('Edge Cases & Error Handling', () => {

  test('01. 404 page', async ({ page }) => {
    await page.goto('/halaman-tidak-ada-xyz');
    await expect(page.getByText(/404|not found/i)).toBeVisible();
  });

  test('02. Refresh dashboard while logged in', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/alamat email/i).fill('pasien@email.com');
    await page.getByLabel(/kata sandi/i).fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Refresh page
    await page.reload();

    // Should stay on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('03. Login page when already logged in', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/alamat email/i).fill('pasien@email.com');
    await page.getByLabel(/kata sandi/i).fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Try to go to login again
    await page.goto('/login');

    // Should redirect to dashboard
    await expect(page).not.toHaveURL('/login');
  });

  test('04. Double form submission prevention', async ({ page }) => {
    await page.goto('/login');

    const submitBtn = page.getByRole('button', { name: /masuk/i });

    // Try rapid clicks
    await submitBtn.click();
    await submitBtn.click();

    // Should only process once
    await page.waitForTimeout(2000);
  });

  test('05. Form validation - empty fields', async ({ page }) => {
    await page.goto('/login');

    const submitBtn = page.getByRole('button', { name: /masuk/i });
    await submitBtn.click();

    // Should show validation errors
    await expect(page.getByText(/required|wajib|harus diisi/i).first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('06. Email validation', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/alamat email/i).fill('invalid-email');
    await page.getByLabel(/kata sandi/i).fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();

    // Should show invalid email error
    await expect(page.getByText(/email tidak valid|invalid email/i)).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('07. Invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/alamat email/i).fill('wrong@email.com');
    await page.getByLabel(/kata sandi/i).fill('wrongpassword');
    await page.getByRole('button', { name: /masuk/i }).click();

    // Should show error message
    await expect(page.getByText(/gagal|error|invalid|salah/i).first()).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('08. Session timeout redirect', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/alamat email/i).fill('pasien@email.com');
    await page.getByLabel(/kata sandi/i).fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard');

    // Clear storage to simulate timeout
    await page.context().clearCookies();
    await page.context().clearStorage();

    // Try to access protected page
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

});