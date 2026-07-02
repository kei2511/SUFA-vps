# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-critical-issues.spec.ts >> Critical Issues Verification (from June 28 Report) >> ISSUE #5: Non-functional menu items
- Location: e2e\06-critical-issues.spec.ts:84:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('Password')

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Critical Issues Verification (from June 28 Report)', () => {
  4   | 
  5   |   test('ISSUE #1: Menu navigation mismatch', async ({ page }) => {
  6   |     await page.goto('/login');
  7   |     await page.getByLabel(/alamat email/i).fill('pasien@email.com');
  8   |     await page.getByLabel(/kata sandi/i).fill('password123');
  9   |     await page.getByRole('button', { name: /masuk/i }).click();
  10  |     await page.waitForURL('**/dashboard', { timeout: 15000 });
  11  | 
  12  |     console.log('Expected menu: Dashboard, Skrining, Riwayat, Notifikasi, Profil');
  13  |     console.log('Previous actual: Dashboard, Riwayat Skrining, Janji Temu, Pusat Bantuan');
  14  | 
  15  |     // Check which menus are present
  16  |     const menuItems = await page.locator('nav a, aside a').allTextContents();
  17  |     console.log('Current menu items:', menuItems);
  18  | 
  19  |     // Check for expected items
  20  |     const hasSkrining = menuItems.some(item => /skrining/i.test(item));
  21  |     const hasNotifikasi = menuItems.some(item => /notifikasi/i.test(item));
  22  |     const hasProfil = menuItems.some(item => /profil|profile/i.test(item));
  23  | 
  24  |     console.log({
  25  |       hasSkrining,
  26  |       hasNotifikasi,
  27  |       hasProfil
  28  |     });
  29  |   });
  30  | 
  31  |   test('ISSUE #2: Bottom nav missing on mobile', async ({ page }) => {
  32  |     await page.setViewportSize({ width: 375, height: 667 });
  33  |     await page.goto('/login');
  34  |     await page.getByLabel(/alamat email/i).fill('pasien@email.com');
  35  |     await page.getByLabel(/kata sandi/i).fill('password123');
  36  |     await page.getByRole('button', { name: /masuk/i }).click();
  37  |     await page.waitForURL('**/dashboard', { timeout: 15000 });
  38  | 
  39  |     // Check for bottom navigation
  40  |     const bottomNav = page.locator('[class*="bottom"], [class*="fixed bottom"]');
  41  |     const isVisible = await bottomNav.count();
  42  | 
  43  |     console.log('Bottom navigation elements found:', isVisible);
  44  | 
  45  |     if (isVisible === 0) {
  46  |       console.log('⚠️ CRITICAL: Bottom navigation NOT found on mobile viewport');
  47  |     }
  48  |   });
  49  | 
  50  |   test('ISSUE #3: Session timeout check', async ({ page }) => {
  51  |     await page.goto('/login');
  52  |     await page.getByLabel(/alamat email/i).fill('pasien@email.com');
  53  |     await page.getByLabel(/kata sandi/i).fill('password123');
  54  |     await page.getByRole('button', { name: /masuk/i }).click();
  55  |     await page.waitForURL('**/dashboard', { timeout: 15000 });
  56  | 
  57  |     // Wait 2 minutes to check session
  58  |     console.log('Checking session stability...');
  59  |     await page.waitForTimeout(120000); // 2 minutes
  60  | 
  61  |     // Try to navigate
  62  |     await page.goto('/history');
  63  | 
  64  |     // Check if still authenticated
  65  |     const isStillLoggedIn = page.url().includes('history') && !page.url().includes('login');
  66  |     console.log('Still authenticated after 2 min:', isStillLoggedIn);
  67  |   });
  68  | 
  69  |   test('ISSUE #4: Kontak Profesional locked', async ({ page }) => {
  70  |     await page.goto('/login');
  71  |     await page.getByLabel(/alamat email/i).fill('pasien@email.com');
  72  |     await page.getByLabel(/kata sandi/i).fill('password123');
  73  |     await page.getByRole('button', { name: /masuk/i }).click();
  74  |     await page.waitForURL('**/dashboard', { timeout: 15000 });
  75  | 
  76  |     // Try to access contacts
  77  |     await page.goto('/intervention/1/contact');
  78  | 
  79  |     // Check if locked or accessible
  80  |     const isLocked = await page.getByText(/terkunci|locked/i).isVisible().catch(() => false);
  81  |     console.log('Kontak Profesional is locked:', isLocked);
  82  |   });
  83  | 
  84  |   test('ISSUE #5: Non-functional menu items', async ({ page }) => {
  85  |     await page.goto('/login');
  86  |     await page.getByLabel('Email').fill('pasien@email.com');
> 87  |     await page.getByLabel('Password').fill('password123');
      |                                       ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  88  |     await page.getByRole('button', { name: /masuk/i }).click();
  89  |     await page.waitForURL('**/dashboard');
  90  | 
  91  |     const currentUrl = page.url();
  92  | 
  93  |     // Try clicking "Janji Temu" if exists
  94  |     const janjiTemuLink = page.getByRole('link', { name: /janji temu/i });
  95  |     if (await janjiTemuLink.isVisible()) {
  96  |       await janjiTemuLink.click();
  97  |       await page.waitForTimeout(1000);
  98  | 
  99  |       const newUrl = page.url();
  100 |       const didNavigate = currentUrl !== newUrl;
  101 |       console.log('Janji Temu navigated:', didNavigate);
  102 |     }
  103 | 
  104 |     // Try clicking "Pusat Bantuan" if exists
  105 |     const pusatBantuanLink = page.getByRole('link', { name: /pusat bantuan/i });
  106 |     if (await pusatBantuanLink.isVisible()) {
  107 |       await pusatBantuanLink.click();
  108 |       await page.waitForTimeout(1000);
  109 | 
  110 |       const newUrl2 = page.url();
  111 |       const didNavigate2 = newUrl !== newUrl2;
  112 |       console.log('Pusat Bantuan navigated:', didNavigate2);
  113 |     }
  114 |   });
  115 | 
  116 | });
```