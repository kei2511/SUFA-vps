import { test, expect } from '@playwright/test';

test.describe('Public Pages - Login & Registration', () => {

  test('01. Login page loads correctly', async ({ page }) => {
    await page.goto('/login');

    // Check logo and heading
    await expect(page.getByRole('heading', { name: /masuk ke akun/i })).toBeVisible();

    // Check branding (NOT Kemenkes)
    await expect(page.getByText(/layanan kesehatan jiwa mhfa/i)).toBeVisible();

    // Check form fields
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
  });

  test('02. Password toggle works', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input#password');

    // Initially should be type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle (eye icon)
    const toggleButton = page.locator('button[aria-label*="sandi"], button[aria-label*="password"]').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      // Should change to type="text"
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('03. Forgot password link works', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /lupa kata sandi/i }).click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('04. Register link works', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /daftar sekarang/i }).click();
    await expect(page).toHaveURL(/register/);
  });

  test('05. Registration page has all fields', async ({ page }) => {
    await page.goto('/register');

    // Check all required fields
    await expect(page.getByLabel(/kode undangan/i)).toBeVisible();
    await expect(page.getByLabel(/nama lengkap/i)).toBeVisible();
    await expect(page.getByLabel(/nomor telepon/i)).toBeVisible();
    await expect(page.getByLabel(/alamat email|email/i)).toBeVisible();
    await expect(page.getByLabel(/tanggal lahir/i)).toBeVisible();
    await expect(page.getByLabel(/kata sandi|password/i).first()).toBeVisible();
    await expect(page.getByLabel(/konfirmasi kata sandi|konfirmasi password/i)).toBeVisible();

    // Check "Sudah punya akun?" link
    await expect(page.getByRole('link', { name: /masuk/i })).toBeVisible();
  });

  test('06. Reset password page loads', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.locator('input#password')).toBeVisible();
  });

  test('07. 404 page works', async ({ page }) => {
    await page.goto('/halaman-tidak-ada-xyz-123');
    await expect(page.getByText(/404|not found/i)).toBeVisible();
  });

});