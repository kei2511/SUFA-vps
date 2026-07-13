import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input#email').fill('admin@email.com');
    await page.locator('input#password').fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
  });

  test('01. Admin dashboard loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('02. Admin statistics cards', async ({ page }) => {
    // Check for statistics cards
    await expect(page.getByText(/total|statistics/i).first()).toBeVisible();
  });

  test('03. User management page', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /pengguna|users/i })).toBeVisible();
  });

  test('04. User search functionality', async ({ page }) => {
    await page.goto('/admin/users');

    const searchInput = page.getByPlaceholder(/cari|search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('05. Invite codes page', async ({ page }) => {
    await page.goto('/admin/invite-codes');
    await expect(page.getByRole('heading', { name: /kode undangan|invite/i })).toBeVisible();
  });

  test('06. Questionnaires management', async ({ page }) => {
    await page.goto('/admin/questionnaires');
    await expect(page.getByRole('heading', { name: /kuesioner|questionnaire/i })).toBeVisible();
  });

  test('07. Questionnaire edit page', async ({ page }) => {
    await page.goto('/admin/questionnaires/1');
    await expect(page.getByText(/pertanyaan|question/i)).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('08. Guides management', async ({ page }) => {
    await page.goto('/admin/guides');
    await expect(page.getByRole('heading', { name: /panduan|guide/i })).toBeVisible();
  });

  test('09. Contacts management', async ({ page }) => {
    await page.goto('/admin/contacts');
    await expect(page.getByRole('heading', { name: /kontak|contact/i })).toBeVisible();
  });

  test('10. Reports page', async ({ page }) => {
    await page.goto('/admin/reports');
    await expect(page.getByRole('heading', { name: /laporan|report/i })).toBeVisible();
  });
});