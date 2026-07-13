import { test, expect } from '@playwright/test';

test.describe('Critical Issues Verification (from June 28 Report)', () => {

  test('ISSUE #1: Menu navigation mismatch', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input#email').fill('pasien@email.com');
    await page.locator('input#password').fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    console.log('Expected menu: Dashboard, Skrining, Riwayat, Notifikasi, Profil');
    console.log('Previous actual: Dashboard, Riwayat Skrining, Janji Temu, Pusat Bantuan');

    // Check which menus are present
    const menuItems = await page.locator('nav a, aside a').allTextContents();
    console.log('Current menu items:', menuItems);

    // Check for expected items
    const hasSkrining = menuItems.some(item => /skrining/i.test(item));
    const hasNotifikasi = menuItems.some(item => /notifikasi/i.test(item));
    const hasProfil = menuItems.some(item => /profil|profile/i.test(item));

    console.log({
      hasSkrining,
      hasNotifikasi,
      hasProfil
    });
  });

  test('ISSUE #2: Bottom nav missing on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.locator('input#email').fill('pasien@email.com');
    await page.locator('input#password').fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Check for bottom navigation
    const bottomNav = page.locator('[class*="bottom"], [class*="fixed bottom"]');
    const isVisible = await bottomNav.count();

    console.log('Bottom navigation elements found:', isVisible);

    if (isVisible === 0) {
      console.log('⚠️ CRITICAL: Bottom navigation NOT found on mobile viewport');
    }
  });

  test('ISSUE #3: Session timeout check', async ({ page }) => {
    test.setTimeout(150000);
    await page.goto('/login');
    await page.locator('input#email').fill('pasien@email.com');
    await page.locator('input#password').fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Wait 2 minutes to check session
    console.log('Checking session stability...');
    await page.waitForTimeout(120000); // 2 minutes

    // Try to navigate
    await page.goto('/history');

    // Check if still authenticated
    const isStillLoggedIn = page.url().includes('history') && !page.url().includes('login');
    console.log('Still authenticated after 2 min:', isStillLoggedIn);
  });

  test('ISSUE #4: Kontak Profesional locked', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input#email').fill('pasien@email.com');
    await page.locator('input#password').fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Try to access contacts
    await page.goto('/intervention/1/contact');

    // Check if locked or accessible
    const isLocked = await page.getByText(/terkunci|locked/i).isVisible().catch(() => false);
    console.log('Kontak Profesional is locked:', isLocked);
  });

  test('ISSUE #5: Non-functional menu items', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input#email').fill('pasien@email.com');
    await page.locator('input#password').fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard');

    const currentUrl = page.url();
    let newUrl = currentUrl;

    // Try clicking "Janji Temu" if exists
    const janjiTemuLink = page.getByRole('link', { name: /janji temu/i });
    if (await janjiTemuLink.isVisible()) {
      await janjiTemuLink.click();
      await page.waitForTimeout(1000);

      newUrl = page.url();
      const didNavigate = currentUrl !== newUrl;
      console.log('Janji Temu navigated:', didNavigate);
    }

    // Try clicking "Pusat Bantuan" if exists
    const pusatBantuanLink = page.getByRole('link', { name: /pusat bantuan/i });
    if (await pusatBantuanLink.isVisible()) {
      await pusatBantuanLink.click();
      await page.waitForTimeout(1000);

      const newUrl2 = page.url();
      const didNavigate2 = newUrl !== newUrl2;
      console.log('Pusat Bantuan navigated:', didNavigate2);
    }
  });

});