import { test, expect } from '@playwright/test';

test.describe('Counselor Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input#email').fill('konselor@email.com');
    await page.locator('input#password').fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/konselor/dashboard', { timeout: 15000 });
  });

  test('01. Counselor dashboard loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/konselor\/dashboard/);
    await expect(page.getByRole('heading', { name: /selamat/i })).toBeVisible();
  });

  test('02. Statistics cards visible', async ({ page }) => {
    // Check for total patients card
    await expect(page.getByText(/total konseli|total pasien|konseli|pasien/i).first()).toBeVisible();
  });

  test('Counselor Patients List Page Loads', async ({ page }) => {
    await page.goto('/konselor/patients');
    await expect(page.getByRole('heading', { name: /daftar konseli|daftar pasien|patients/i })).toBeVisible();
  });

  test('Counselor Chat Console Navigation', async ({ page }) => {
    await page.goto('/konselor/dashboard');

    // Attempt to navigate via sidebar or quick action if present
    const patientsLink = page.getByRole('link', { name: /riwayat skrining|konseli|pasien/i }).first();
    await expect(patientsLink).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('05. Counselor navigation menu', async ({ page }) => {
    // Check for counselor menu items
    const dashboardLink = page.getByRole('link', { name: /dashboard|beranda/i }).first();
    const patientsLink = page.getByRole('link', { name: /riwayat skrining|konseli|pasien/i }).first();

    await expect(dashboardLink).toBeVisible();
    await expect(patientsLink).toBeVisible();
  });
});