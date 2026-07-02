# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-responsive.spec.ts >> Responsive & Mobile UI >> 03. Mobile - Login form responsive
- Location: e2e\05-responsive.spec.ts:37:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel(/password/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByLabel(/password/i)

```

```yaml
- main:
  - text: health_and_safety
  - heading "Masuk ke Akun" [level=1]
  - paragraph: Layanan Kesehatan Jiwa MHFA
  - text: Alamat Email mail
  - textbox "Alamat Email":
    - /placeholder: contoh@email.com
  - text: Kata Sandi lock
  - textbox "Kata Sandi":
    - /placeholder: Masukkan kata sandi Anda
  - button "Tampilkan kata sandi": visibility
  - link "Lupa kata sandi?":
    - /url: /forgot-password
  - button "Masuk arrow_forward"
  - text: Atau Belum punya akun?
  - link "Daftar sekarang":
    - /url: /register
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Responsive & Mobile UI', () => {
  4  | 
  5  |   test('01. Desktop layout - Sidebar visible', async ({ page }) => {
  6  |     await page.setViewportSize({ width: 1920, height: 1080 });
  7  |     await page.goto('/login');
  8  |     await page.getByLabel(/alamat email/i).fill('pasien@email.com');
  9  |     await page.getByLabel(/kata sandi/i).fill('password123');
  10 |     await page.getByRole('button', { name: /masuk/i }).click();
  11 |     await page.waitForURL('**/dashboard', { timeout: 15000 });
  12 | 
  13 |     // Check if sidebar is visible on desktop
  14 |     const sidebar = page.locator('nav, aside, [class*="sidebar"]').first();
  15 |     await expect(sidebar).toBeVisible();
  16 |   });
  17 | 
  18 |   test('02. Mobile layout - Bottom navigation', async ({ page }) => {
  19 |     await page.setViewportSize({ width: 375, height: 667 });
  20 |     await page.goto('/login');
  21 |     await page.getByLabel(/alamat email/i).fill('pasien@email.com');
  22 |     await page.getByLabel(/kata sandi/i).fill('password123');
  23 |     await page.getByRole('button', { name: /masuk/i }).click();
  24 |     await page.waitForURL('**/dashboard', { timeout: 15000 });
  25 | 
  26 |     // CRITICAL: Check if bottom navigation appears on mobile
  27 |     const bottomNav = page.locator('[class*="bottom"], [class*="mobile-nav"]');
  28 | 
  29 |     // This is a known issue from previous report
  30 |     const isVisible = await bottomNav.isVisible().catch(() => false);
  31 | 
  32 |     if (!isVisible) {
  33 |       console.log('⚠️ ISSUE CONFIRMED: Bottom navigation NOT visible on mobile');
  34 |     }
  35 |   });
  36 | 
  37 |   test('03. Mobile - Login form responsive', async ({ page }) => {
  38 |     await page.setViewportSize({ width: 375, height: 667 });
  39 |     await page.goto('/login');
  40 | 
  41 |     // Check if form is responsive
  42 |     await expect(page.getByLabel(/email/i)).toBeVisible();
> 43 |     await expect(page.getByLabel(/password/i)).toBeVisible();
     |                                                ^ Error: expect(locator).toBeVisible() failed
  44 |     await expect(page.getByRole('button', { name: /masuk/i })).toBeVisible();
  45 |   });
  46 | 
  47 |   test('04. Tablet layout', async ({ page }) => {
  48 |     await page.setViewportSize({ width: 768, height: 1024 });
  49 |     await page.goto('/login');
  50 | 
  51 |     await expect(page.getByRole('heading', { name: /masuk/i })).toBeVisible();
  52 |   });
  53 | 
  54 |   test('05. Branding consistency - No Kemenkes', async ({ page }) => {
  55 |     await page.goto('/login');
  56 | 
  57 |     // Should have MHFA branding
  58 |     await expect(page.getByText(/mhfa/i)).toBeVisible();
  59 | 
  60 |     // Should NOT have Kemenkes
  61 |     const kemenkesText = page.getByText(/kemenkes|kementerian kesehatan/i);
  62 |     await expect(kemenkesText).not.toBeVisible();
  63 |   });
  64 | 
  65 | });
```