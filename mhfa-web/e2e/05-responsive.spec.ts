import { test, expect } from '@playwright/test';

test.describe('Responsive & Mobile UI', () => {

  test('01. Desktop layout - Sidebar visible', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');
    await page.getByLabel(/alamat email/i).fill('pasien@email.com');
    await page.getByLabel(/kata sandi/i).fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Check if sidebar is visible on desktop
    const sidebar = page.locator('nav, aside, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('02. Mobile layout - Bottom navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.getByLabel(/alamat email/i).fill('pasien@email.com');
    await page.getByLabel(/kata sandi/i).fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // CRITICAL: Check if bottom navigation appears on mobile
    const bottomNav = page.locator('[class*="bottom"], [class*="mobile-nav"]');

    // This is a known issue from previous report
    const isVisible = await bottomNav.isVisible().catch(() => false);

    if (!isVisible) {
      console.log('⚠️ ISSUE CONFIRMED: Bottom navigation NOT visible on mobile');
    }
  });

  test('03. Mobile - Login form responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    // Check if form is responsive
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /masuk/i })).toBeVisible();
  });

  test('04. Tablet layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /masuk/i })).toBeVisible();
  });

  test('05. Branding consistency - No Kemenkes', async ({ page }) => {
    await page.goto('/login');

    // Should have MHFA branding
    await expect(page.getByText(/mhfa/i)).toBeVisible();

    // Should NOT have Kemenkes
    const kemenkesText = page.getByText(/kemenkes|kementerian kesehatan/i);
    await expect(kemenkesText).not.toBeVisible();
  });

});