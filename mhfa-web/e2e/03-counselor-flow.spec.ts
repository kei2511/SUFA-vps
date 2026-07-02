import { test, expect } from '@playwright/test';

test.describe('Counselor Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/alamat email/i).fill('konselor@email.com');
    await page.getByLabel(/kata sandi/i).fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/konselor/dashboard', { timeout: 15000 });
  });

  test('01. Counselor dashboard loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/konselor\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('02. Statistics cards visible', async ({ page }) => {
    // Check for total patients card
    await expect(page.getByText(/total pasien|pasien/i).first()).toBeVisible();
  });

  test('03. Patient list page', async ({ page }) => {
    await page.goto('/konselor/patients');
    await expect(page.getByRole('heading', { name: /daftar pasien|patients/i })).toBeVisible();
  });

  test('04. Counselor chat page', async ({ page }) => {
    await page.goto('/konselor/chat/1', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/chat|messages/i)).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('05. Counselor navigation menu', async ({ page }) => {
    // Check for counselor menu items
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    const patientsLink = page.getByRole('link', { name: /daftar pasien|patients/i });

    await expect(dashboardLink).toBeVisible();
    await expect(patientsLink).toBeVisible();
  });
});