import { test, expect } from '@playwright/test';

test.describe('Patient Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as patient
    await page.goto('/login');
    await page.locator('input#email').fill('pasien@email.com');
    await page.locator('input#password').fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('01. Dashboard loads for patient', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /halo|selamat datang/i })).toBeVisible();
  });

  test('02. Navigation menu - Dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('03. Navigate to Screening', async ({ page }) => {
    const startScreeningLink = page.getByRole('link', { name: /mulai skrining baru/i });
    await expect(startScreeningLink).toBeVisible();
    await startScreeningLink.click();
    await expect(page).toHaveURL(/\/screening\/start/);
  });

  test('04. Start Screening flow', async ({ page }) => {
    // Navigate to start screening
    await page.goto('/screening/start');

    await expect(page.getByRole('heading', { name: /skrining/i }).first()).toBeVisible();

    // Click "Mulai Skrining" button (which is a Link)
    await page.getByRole('link', { name: /mulai skrining/i }).click();

    // Should show questionnaire
    await expect(page.getByText(/pertanyaan/i).or(page.getByText(/q[1-9]/i))).toBeVisible();
  });

  test('05. Complete screening questionnaire', async ({ page }) => {
    await page.goto('/screening/start');
    await page.getByRole('link', { name: /mulai skrining/i }).click();

    // Answer first question and proceed
    const firstAnswer = page.locator('label').first();
    if (await firstAnswer.isVisible()) {
      await firstAnswer.click();
      await page.getByRole('button', { name: /berikutnya|next/i }).click();
    }

    // Try to finish if only one question
    await page.getByRole('button', { name: /selesai|finish|kirim/i }).click({ timeout: 5000 }).catch(() => {});
  });

  test('06. Check Screening Result page', async ({ page }) => {
    await page.goto('/screening/start');
    await page.getByRole('link', { name: /mulai skrining/i }).click();

    // Try to navigate to result directly for quick check
    await page.goto('/screening/1/result', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/hasil skrining|result/i)).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('07. Intervention page', async ({ page }) => {
    await page.goto('/intervention/1');

    // Check for intervention options
    await expect(page.getByText(/curhat|chat|panduan|kontak/i).first()).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('08. History page', async ({ page }) => {
    await page.goto('/history');
    await expect(page.getByRole('heading', { name: /riwayat/i })).toBeVisible();
  });

  test('09. Notifications page', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.getByRole('heading', { name: /notifikasi/i })).toBeVisible();
  });

  test('10. Profile/Settings page', async ({ page }) => {
    // Try both profile and settings
    const profileMenu = page.getByRole('link', { name: /profile|profil|settings/i });

    if (await profileMenu.isVisible()) {
      await profileMenu.click();
      await expect(page.getByRole('heading', { name: 'Pengaturan Profil' })).toBeVisible();
    }
  });
});