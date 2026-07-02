# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-responsive.spec.ts >> Responsive & Mobile UI >> 02. Mobile layout - Bottom navigation
- Location: e2e\05-responsive.spec.ts:18:7

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel(/kata sandi/i) resolved to 2 elements:
    1) <input value="" required="" id="password" type="password" placeholder="Masukkan kata sandi Anda" class="w-full pl-10 pr-12 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant"/> aka getByRole('textbox', { name: 'Kata Sandi' })
    2) <button type="button" aria-label="Tampilkan kata sandi" class="absolute right-3 p-1 rounded hover:bg-surface-container text-outline focus:outline-none focus:ring-2 focus:ring-primary">…</button> aka getByRole('button', { name: 'Tampilkan kata sandi' })

Call log:
  - waiting for getByLabel(/kata sandi/i)

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e6]: health_and_safety
      - heading "Masuk ke Akun" [level=1] [ref=e7]
      - paragraph [ref=e8]: Layanan Kesehatan Jiwa MHFA
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Alamat Email
        - generic [ref=e12]:
          - generic [ref=e13]: mail
          - textbox "Alamat Email" [active] [ref=e14]:
            - /placeholder: contoh@email.com
            - text: pasien@email.com
      - generic [ref=e15]:
        - generic [ref=e16]: Kata Sandi
        - generic [ref=e17]:
          - generic [ref=e18]: lock
          - textbox "Kata Sandi" [ref=e19]:
            - /placeholder: Masukkan kata sandi Anda
          - button "Tampilkan kata sandi" [ref=e20]:
            - generic [ref=e21]: visibility
      - link "Lupa kata sandi?" [ref=e23] [cursor=pointer]:
        - /url: /forgot-password
      - button "Masuk arrow_forward" [ref=e24]:
        - text: Masuk
        - generic [ref=e25]: arrow_forward
    - generic [ref=e28]: Atau
    - generic [ref=e30]:
      - text: Belum punya akun?
      - link "Daftar sekarang" [ref=e31] [cursor=pointer]:
        - /url: /register
  - alert [ref=e32]
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
> 22 |     await page.getByLabel(/kata sandi/i).fill('password123');
     |                                          ^ Error: locator.fill: Error: strict mode violation: getByLabel(/kata sandi/i) resolved to 2 elements:
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
  43 |     await expect(page.getByLabel(/password/i)).toBeVisible();
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